import { Page } from '@playwright/test';
import { LocatorCandidate } from '../../models/LocatorCandidate';

export async function genByAria(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const selector = `[aria-label*="${targetName}"]`;
  const count = await page.locator(selector).count();

  if (count === 0) return [];

  return [{
    strategy: 'aria',
    selector,
    matchCount: count
  }];
}
