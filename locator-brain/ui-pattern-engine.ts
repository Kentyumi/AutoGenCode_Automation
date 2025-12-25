import type { Browser , ChainablePromiseElement } from 'webdriverio'
import { UI_PATTERN_RULES } from './ui-pattern.rules'
import { UIPattern, PatternRule } from './ui-pattern.types'

/**
 * Runtime element reference used by WDIO
 * NOTE:
 * - elementId is NOT DOM id
 * - It is valid only within current WebDriver session
 */
export type ElementRef = { elementId: string }

/**
 * Try to match a single rule against DOM
 */
async function matchRule(
  browser: Browser,
  rule: PatternRule
): Promise<WebdriverIO.Element | null> {

  // Determine search scope
  const scope =
    rule.container === 'header'
      ? await browser.$('header')
      : rule.container === 'nav'
      ? await browser.$('nav')
      : browser

  if ('isExisting' in scope && !(await scope.isExisting())) {
    return null
  }

  const candidates = await scope.$$('*')

  for (const el of candidates) {
    // role check
    if (rule.role) {
      const role = await el.getAttribute('role')
      if (role !== rule.role) continue
    }

    // aria-label check
    if (rule.ariaLabel) {
      const label = await el.getAttribute('aria-label')
      if (!label || !rule.ariaLabel.test(label)) continue
    }

    // class name heuristic
    if (rule.classLike) {
      const cls = await el.getAttribute('class')
      if (!cls || !rule.classLike.test(cls)) continue
    }

    // svg existence
    if (rule.hasSvg) {
      const svg = await el.$('svg')
      if (!(await svg.isExisting())) continue
    }

    // clickable check (final gate)
    if (await el.isClickable()) {
      return el
    }
  }

  return null
}

/**
 * Resolve UI control by pattern (hamburger, kebab, dropdown, etc.)
 * Returns runtime element reference (elementId)
 */
export async function resolveUIPattern(
  browser: Browser,
  pattern: UIPattern
): Promise<ChainablePromiseElement | null> {

  const rules = UI_PATTERN_RULES[pattern]
  if (!rules) return null

  for (const rule of rules) {
    const el = await matchRule(browser, rule)
    if (el) {
      return await el
    }
  }

  return null
}

