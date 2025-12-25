import { Page } from '@playwright/test';
import { LocatorCandidate } from '../../models/LocatorCandidate';

const DATA_ATTRS = [
  'data-testid',
  'data-test',
  'data-qa'
];

export async function genByDataAttr(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const results: LocatorCandidate[] = [];

  for (const attr of DATA_ATTRS) {
    const selector = `[${attr}*="${targetName}"]`;
    const count = await page.locator(selector).count();

    if (count > 0) {
      results.push({
        strategy: 'data-attr',
        selector,
        matchCount: count
      });
    }
  }

  return results;
}
