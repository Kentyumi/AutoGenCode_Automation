import { decideLocator } from './decision-engine';
import { generateCandidates, DomElementInfo, LocatorCandidate } from './candidate-generator';
import { getLocator, saveLocator, loadRegistry } from './registry';

loadRegistry();

export function scanDom(): DomElementInfo[] {
  return [];
}

/**
 * smart$ resolves a logical element name into WebdriverIO ChainablePromiseElement
 */
export async function smart$(browser: WebdriverIO.Browser, logicalName: string): Promise<WebdriverIO.ChainablePromiseElement<WebdriverIO.Element>> {
  const cached = getLocator(logicalName);
  if (cached) {
    return browser.$(cached); // async, type inferred as ChainablePromiseElement
  }

  const dom = scanDom();
  const matched = dom.find(e => e.id?.includes(logicalName.replace('_', '-')));
  if (!matched) {
    throw new Error(`Locator Brain: cannot find target "${logicalName}"`);
  }

  const candidates: LocatorCandidate[] = generateCandidates(matched);
  const decision = decideLocator(logicalName, candidates);

  saveLocator(logicalName, decision.chosen.value);

  console.log('[LocatorBrain Decision]', decision);

  return browser.$(decision.chosen.value); // async
}
