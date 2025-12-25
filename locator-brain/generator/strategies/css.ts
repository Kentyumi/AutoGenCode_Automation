import { Page } from '@playwright/test';
import { LocatorCandidate } from '../../models/LocatorCandidate';

export async function genByCss(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const selector = `button[class*="${targetName}"], input[name*="${targetName}"]`;
  const count = await page.locator(selector).count();

  if (count === 0) return [];

  return [{
    strategy: 'css',
    selector,
    matchCount: count
  }];
}
