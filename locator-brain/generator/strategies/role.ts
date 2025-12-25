import { Page } from '@playwright/test';
import { LocatorCandidate } from '../../models/LocatorCandidate';

const ROLES = ['button', 'link', 'textbox'];

export async function genByRole(
  page: Page,
  targetName: string
): Promise<LocatorCandidate[]> {
  const results: LocatorCandidate[] = [];

  for (const role of ROLES) {
    const locator = page.getByRole(role as any, {
      name: new RegExp(targetName, 'i')
    });

    const count = await locator.count();
    if (count > 0) {
      results.push({
        strategy: 'role',
        selector: `role=${role} name~${targetName}`,
        matchCount: count
      });
    }
  }

  return results;
}
