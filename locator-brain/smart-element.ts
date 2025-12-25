import { decideLocator } from './decision-engine'
import { generateCandidates } from './candidate-generator'
import { getLocator, saveLocator, loadRegistry } from './registry'
import type { Browser, ChainablePromiseElement } from 'webdriverio'
import { DomElementInfo } from './types'
import { logDecision } from './logger'

loadRegistry()

export type ActionType = 'type' | 'click' | 'assert'

/* ---------------- utils ---------------- */
function normalize(text?: string): string {
  return (text || '').toLowerCase().replace(/[_\-]/g, ' ').replace(/\s+/g, ' ').trim()
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
  return e.tag === 'input' || e.tag === 'textarea' || e.attributes?.contenteditable === 'true'
}

function isClickable(e: DomElementInfo) {
  return (
    e.tag === 'button' ||
    e.tag === 'a' ||
    e.attributes?.role === 'button' ||
    e.attributes?.['aria-expanded'] !== undefined ||
    e.attributes?.['data-testid'] !== undefined
  )
}

function filterByAction(dom: DomElementInfo[], action: ActionType) {
  if (action === 'type') return dom.filter(isTypeable)
  if (action === 'click') return dom.filter(isClickable)
  return dom
}

/* ---------------- matching logic ---------------- */
function matchElement(e: DomElementInfo, target: string, action: ActionType): boolean {
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

  // direct semantic match
  if (fields.some(f => fuzzyIncludes(f, target))) return true

  // hamburger/menu heuristic
  if (action === 'click' && /(hamburger|hamberger|menu|nav|toggle)/.test(target)) {
    return !!(
      e.ariaLabel?.match(/menu|navigation|toggle/i) ||
      e.className?.match(/menu|hamburger|nav|toggle/i) ||
      e.attributes?.['data-testid']?.match(/menu|hamburger/i)
    )
  }

  return false
}

/* ---------------- smart$ core ---------------- */
export async function smart$(
  browser: Browser,
  logicalName: string,
  action?: ActionType
): Promise<ChainablePromiseElement> {
  const resolvedAction = action ?? inferAction(logicalName)
  const pageUrl = await browser.getUrl()
  const cacheKey = `${pageUrl}|${resolvedAction}:${logicalName}`

  // ---- cache ----
  const cached = getLocator(cacheKey)
  if (cached) {
    console.log(`[LocatorBrain] Using cached (${resolvedAction}) → ${cached}`)
    const el = await browser.$(cached)
    await el.waitForExist({ timeout: 5000 })
    if (resolvedAction === 'click') {
      await el.waitForDisplayed({ timeout: 5000 })
      await el.waitForClickable({ timeout: 5000 })
    }
    return el
  }

  // ---- scan ----
  const dom = await scanDom(browser)
  const scoped = filterByAction(dom, resolvedAction)
  const target = normalize(logicalName)

  const matched = scoped.find(e => matchElement(e, target, resolvedAction))
  if (!matched) {
    console.error('[LocatorBrain] MATCH FAILED', {
      logicalName,
      action: resolvedAction,
      scanned: scoped.length
    })
    throw new Error(`LocatorBrain: cannot find "${logicalName}" for action "${resolvedAction}"`)
  }

  // ---- decision ----
  const candidates = generateCandidates(matched)
  const decision = decideLocator(logicalName, candidates, resolvedAction)
  saveLocator(cacheKey, decision.chosen.value)
  logDecision(decision)

  // ---- runtime safety ----
  const elem = await browser.$(decision.chosen.value)
  await elem.waitForExist({ timeout: 5000 })
  if (resolvedAction === 'click') {
    await elem.waitForDisplayed({ timeout: 5000 })
    await elem.waitForClickable({ timeout: 5000 })
  }

  return elem
}
