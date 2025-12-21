import { decideLocator } from './decision-engine';
import { generateCandidates } from './candidate-generator';
import { getLocator, saveLocator, loadRegistry } from './registry';
import type { Browser, ChainablePromiseElement } from 'webdriverio';
import { DomElementInfo } from './types';

loadRegistry();

/**
 * Normalize text for semantic matching
 */
function normalize(text?: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scan DOM safely inside browser context
 */
export async function scanDom(browser: Browser): Promise<DomElementInfo[]> {
  return browser.execute(() => {
    const elements = Array.from(
      document.querySelectorAll('input, button, textarea, select, a')
    );

    return elements.map(el => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
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
      };
    });
  });
}

/**
 * smart$ resolves a logical element name into WebdriverIO ChainablePromiseElement
 */
export async function smart$(
  browser: Browser,
  logicalName: string
): Promise<ChainablePromiseElement> {

  // 1️⃣ cache
  const cached = getLocator(logicalName);
  if (cached) {
    return browser.$(cached);
  }

  // 2️⃣ scan DOM
  const dom = await scanDom(browser);

  const target = normalize(logicalName);

  // 3️⃣ semantic matching (strong)
  const matched = dom.find(e => {
    const candidates = [
      e.id,
      e.name,
      e.placeholder,
      e.ariaLabel,
      e.text,
    ].map(normalize);

    return candidates.some(c => c.includes(target) || target.includes(c));
  });

  if (!matched) {
    throw new Error(`Locator Brain: cannot find target "${logicalName}"`);
  }

  // 4️⃣ generate locator candidates
  const candidates = generateCandidates(matched);

  // 5️⃣ decide best locator
  const decision = decideLocator(logicalName, candidates);

  saveLocator(logicalName, decision.chosen.value);

  console.log('[LocatorBrain Decision]', decision);

  return browser.$(decision.chosen.value);
}
