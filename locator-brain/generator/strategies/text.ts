import { Page } from '@playwright/test';
import { LocatorCandidate } from '../../models/LocatorCandidate';

export async function genByText(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const locator = page.getByText(new RegExp(targetName, 'i'));
  const count = await locator.count();

  if (count === 0) return [];

  return [{
    strategy: 'text',
    selector: `text~${targetName}`,
    matchCount: count
  }];
}
