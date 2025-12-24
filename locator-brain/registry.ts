import fs from 'fs';
import path from 'path';

const REGISTRY_FILE = path.join(
  process.cwd(),
  'locator-registry.json'
);

let registry: Record<string, string> = {};

/* ---------------- load ---------------- */

export function loadRegistry() {
  if (fs.existsSync(REGISTRY_FILE)) {
    registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
}

/* ---------------- read ---------------- */

export function getLocator(logicalName: string): string | undefined {
  return registry[logicalName];
}

/* ---------------- write ---------------- */

export function saveLocator(logicalName: string, selector: string) {
  registry[logicalName] = selector;
  persist();
}

/* ---------------- delete (NEW) ---------------- */

export function deleteLocator(logicalName: string) {
  if (registry[logicalName]) {
    delete registry[logicalName];
    persist();
  }
}

/* ---------------- persist ---------------- */

function persist() {
  fs.writeFileSync(
    REGISTRY_FILE,
    JSON.stringify(registry, null, 2),
    'utf-8'
  );
}
