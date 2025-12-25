import type { Browser, ChainablePromiseElement } from 'webdriverio'

import { decideLocator } from './decision-engine'
import { generateCandidates } from './candidate-generator'
import { getLocator, saveLocator, loadRegistry } from './registry'
import { DomElementInfo } from './types'
import { logDecision } from './logger'

import { resolveUIPattern } from './ui-pattern-engine'
import { mapLogicalNameToPattern } from './ui-pattern-mapper'

loadRegistry()

export type ActionType = 'type' | 'click' | 'assert'

/* ---------------- utils ---------------- */
function normalize(text?: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyIncludes(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a)
}

/* ---------------- action inference ---------------- */
function inferAction(logicalName: string): ActionType {
  const n = logicalName.toLowerCase()
  if (/(input|field|textbox|email|password|username)/.test(n)) return 'type'
  if (/(button|btn|submit|save|login|menu|hamburger|toggle)/.test(n)) return 'click'
  return 'assert'
}

/* ---------------- DOM scan ---------------- */
export async function scanDom(browser: Browser): Promise<DomElementInfo[]> {
  return browser.execute(() => {
    const elements = Array.from(
      document.querySelectorAll(
        'input, button, textarea, select, a, [role], [aria-label], [data-testid]'
      )
    )

    return elements.map(el => {
      const attrs: Record<string, string> = {}
      for (const attr of el.attributes) attrs[attr.name] = attr.value

      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        name: (el as HTMLInputElement).name || undefined,
        placeholder: (el as HTMLInputElement).placeholder || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
        className: el.className || undefined,
        text: el.textContent?.trim() || undefined,
        attributes: attrs
      }
    })
  })
}

/* ---------------- action filtering ---------------- */
function isTypeable(e: DomElementInfo) {
  return e.tag === 'input' || e.tag === 'textarea'
}

function isClickable(e: DomElementInfo) {
  return (
    e.tag === 'button' ||
    e.tag === 'a' ||
    e.attributes?.role === 'button' ||
    e.attributes?.['data-testid'] !== undefined
  )
}

function filterByAction(dom: DomElementInfo[], action: ActionType) {
  if (action === 'type') return dom.filter(isTypeable)
  if (action === 'click') return dom.filter(isClickable)
  return dom
}

function matchElement(e: DomElementInfo, target: string): boolean {
  const fields = [
    e.id,
    e.name,
    e.placeholder,
    e.ariaLabel,
    e.text,
    e.className,
    e.attributes?.['data-testid']
  ]
    .filter(Boolean)
    .map(normalize)

  return fields.some(f => fuzzyIncludes(f, target))
}

/* ===================== smart$ ===================== */
export async function smart$(
  browser: Browser,
  logicalName: string,
  action?: ActionType
): Promise<ChainablePromiseElement> {

  const resolvedAction = action ?? inferAction(logicalName)
  const pageUrl = await browser.getUrl()
  const cacheKey = `${pageUrl}|${resolvedAction}:${logicalName}`

  /* ---------- 1. CACHE ---------- */
  const cached = getLocator(cacheKey)
  if (typeof cached === 'string') {
    try {
      const el = browser.$(cached)

      await el.waitForExist({ timeout: 3000 })
      if (resolvedAction === 'click') {
        await el.waitForClickable({ timeout: 3000 })
      }

      return el
    } catch {
      console.warn('[LocatorBrain] Cached locator failed')
    }
  }

  /* ---------- 2. UI PATTERN ENGINE ---------- */
  if (resolvedAction === 'click') {
    const pattern = mapLogicalNameToPattern(logicalName)
    if (pattern) {
      const el = await resolveUIPattern(browser, pattern)
      if (el) return el
    }
  }

  /* ---------- 3. SEMANTIC ---------- */
  const dom = await scanDom(browser)
  const scoped = filterByAction(dom, resolvedAction)
  const target = normalize(logicalName)

  const matched = scoped.filter(e => matchElement(e, target))

  if (matched.length === 0) {
    const fallback = await browser.$$(
      'button, [role="button"], svg, i, div'
    )

    for (const el of fallback) {
      if (await el.isClickable()) {
        return el
      }
    }

    throw new Error(`LocatorBrain: cannot resolve "${logicalName}"`)
  }

  /* ---------- 4. DECISION ---------- */
  const candidates = matched.flatMap(m => generateCandidates(m))
  const decision = decideLocator(logicalName, candidates, resolvedAction)

  saveLocator(cacheKey, decision.chosen.value)
  logDecision(decision)

  /* ---------- 5. FINAL ---------- */
  const elem = browser.$(decision.chosen.value)

  await elem.waitForExist({ timeout: 5000 })
  if (resolvedAction === 'click') {
    await elem.waitForClickable({ timeout: 5000 })
  }

  return elem
}
