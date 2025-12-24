import { decideLocator } from './decision-engine'
import { generateCandidates } from './candidate-generator'
import { getLocator, saveLocator, loadRegistry } from './registry'
import type { Browser, ChainablePromiseElement } from 'webdriverio'
import { DomElementInfo } from './types'
import { logDecision } from './logger'

loadRegistry()

type ActionType = 'type' | 'click' | 'assert'

function normalize(text?: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Scan DOM in browser context
 */
export async function scanDom(browser: Browser): Promise<DomElementInfo[]> {
  return browser.execute(() => {
    const elements = Array.from(
      document.querySelectorAll('input, button, textarea, select, a, [contenteditable], div, span')
    )

    return elements.map(el => {
      const attrs: Record<string, string> = {}
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value
      }

      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        name: (el as HTMLInputElement).name || undefined,
        placeholder: (el as HTMLInputElement).placeholder || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
        className: el.className || undefined,
        text: el.textContent?.trim() || undefined,
        value: (el as HTMLInputElement).value || undefined,
        type: (el as HTMLInputElement).type || undefined,
        attributes: attrs
      }
    })
  })
}

/**
 * Filter DOM by action intent
 */
function filterByAction(dom: DomElementInfo[], action: ActionType): DomElementInfo[] {
  if (action === 'type') {
    return dom.filter(e =>
      e.tag === 'input' ||
      e.tag === 'textarea' ||
      e.attributes?.contenteditable === 'true'
    )
  }

  if (action === 'click') {
    return dom.filter(e =>
      e.tag === 'button' ||
      e.tag === 'a' ||
      (e.tag === 'input' && ['submit', 'button'].includes(e.type || ''))
    )
  }

  return dom // assert
}

/**
 * smart$ — action-aware element resolver
 */
export async function smart$(
  browser: Browser,
  logicalName: string,
  action: ActionType
): Promise<ChainablePromiseElement> {

  const cacheKey = `${action}:${logicalName}`
  const cached = getLocator(cacheKey)
  if (cached) {
    console.log(`[LocatorBrain] Using cached (${action}) → ${cached}`)
    return browser.$(cached)
  }

  const dom = await scanDom(browser)
  const scopedDom = filterByAction(dom, action)

  const target = normalize(logicalName)

  const matched = scopedDom.find(e => {
    const candidates = [
      e.id,
      e.name,
      e.placeholder,
      e.ariaLabel,
      e.text
    ].map(normalize)

    return candidates.some(c => c && (c.includes(target) || target.includes(c)))
  })

  if (!matched) {
    throw new Error(`LocatorBrain: cannot find "${logicalName}" for action "${action}"`)
  }

  const candidates = generateCandidates(matched)
  const decision = decideLocator(logicalName, candidates, action)

  saveLocator(cacheKey, decision.chosen.value)
  logDecision({ ...decision })

  return browser.$(decision.chosen.value)
}
