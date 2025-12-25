import { Page, Locator } from 'playwright';
import { generateCandidates } from '../models/generateCandidates';
import { rankCandidates } from '../scorer/rankCandidates';
import { LocatorCandidate } from '../models/LocatorCandidate';

interface Registry {
  get(target: string): string | undefined;
  propose(target: string, selector: string): void;
}

export class SmartLocatorResolver {

  constructor(private registry: Registry) {}

  async resolve(page: Page, targetName: string): Promise<Locator> {

    // 1. Dùng locator đã approved trước
    const approved = this.registry.get(targetName);
    if (approved) {
      const loc = page.locator(approved);
      if (await loc.count() === 1) {
        return loc;
      }
    }

    // 2. Generate candidates
    const candidates = await generateCandidates(page, targetName);
    if (candidates.length === 0) {
      throw new Error(`No locator candidates for target: ${targetName}`);
    }

    // 3. Rank candidates
    const ranked = await rankCandidates(page, candidates);
    const best = ranked[0];

    if (!best || !best.selector) {
      throw new Error(`Unable to resolve locator for ${targetName}`);
    }

    // 4. Propose locator mới (KHÔNG auto override)
    this.registry.propose(targetName, best.selector);

    return page.locator(best.selector);
  }
}
