export class RegistryAdapter {

  constructor(private registry: Record<string, string>) {}

  get(target: string): string | undefined {
    return this.registry[target];
  }

  propose(target: string, selector: string) {
    console.log(`[LocatorBrain] Proposed locator for "${target}": ${selector}`);
  }
}
