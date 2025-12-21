// locator-brain/registry.ts
// Simple in-memory registry to cache resolved locators
// Can be persisted later to JSON or DB

import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.resolve(__dirname, 'locator-registry.json');

let cache: Record<string, string> = {};

/** Load registry from JSON file if exists */
export function loadRegistry() {
  if (fs.existsSync(REGISTRY_PATH)) {
    cache = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  }
}

/** Get cached locator */
export function getLocator(logicalName: string): string | undefined {
  return cache[logicalName];
}

/** Save locator to registry and persist to JSON */
export function saveLocator(logicalName: string, selector: string) {
  cache[logicalName] = selector;
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(cache, null, 2));
}
