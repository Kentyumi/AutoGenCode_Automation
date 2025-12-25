// demo/bdd-runner.ts
import fs from 'fs';
import path from 'path';
import { remote, Browser, ChainablePromiseElement } from 'webdriverio';
import { smart$, ActionType } from '../locator-brain/smart-element';
import { BASE_URL, TCS_DIR } from './democonfig';

// ---------- Utility ----------
function readTestCases(dir: string): string[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.feature'));
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf-8'));
}

function inferStepAction(line: string): ActionType | undefined {
  if (/I type/.test(line)) return 'type';
  if (/I click/.test(line)) return 'click';
  if (/I should see/.test(line)) return 'assert';
  return undefined;
}

// ---------- Runner ----------
async function run() {
  const browser: Browser = await remote({
    logLevel: 'error',
    capabilities: { browserName: 'chrome' }
  });

  await browser.url(BASE_URL);

  const tcsContents = readTestCases(TCS_DIR);
  console.log(`[Runner] Loaded ${tcsContents.length} feature(s)`);

  for (const content of tcsContents) {
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    for (const line of lines) {
      try {
        // --- Open URL ---
        if (/^Given I open/.test(line)) {
          const match = line.match(/Given I open "(.+)"/);
          if (match) {
            const url = match[1];
            await browser.url(url.startsWith('http') ? url : BASE_URL + url);
            console.log(`[Runner] Opened ${url}`);
          }
        }

        // --- Type ---
        else if (/I type/.test(line)) {
          const match = line.match(/I type "(.+)" into "(.+)"/);
          if (match) {
            const [, value, logicalName] = match;
            const elem: ChainablePromiseElement = await smart$(browser, logicalName, 'type');
            await elem.clearValue();
            await elem.setValue(value);
            console.log(`[Runner] Typed "${value}" into "${logicalName}"`);
          }
        }

        // --- Click ---
        else if (/I click/.test(line)) {
          const match = line.match(/I click "(.+)"/);
          if (match) {
            const logicalName = match[1];
            const elem: ChainablePromiseElement = await smart$(browser, logicalName, 'click');
            await elem.click(); // smart$ đã waitForClickable
            console.log(`[Runner] Clicked "${logicalName}"`);
          }
        }

        // --- Assert ---
        else if (/I should see/.test(line)) {
          const match = line.match(/I should see "(.+)" in "(.+)"/);
          if (match) {
            const [, expected, logicalName] = match;
            const elem: ChainablePromiseElement = await smart$(browser, logicalName, 'assert');
            await elem.waitForDisplayed({ timeout: 5000 });
            const actual = await elem.getText();
            console.log(`[Runner] Assert "${logicalName}" → "${actual}" (expect: "${expected}")`);
          }
        }

        // --- Unrecognized step ---
        else {
          console.warn(`[Runner] Step not recognized: ${line}`);
        }
      } catch (err) {
        console.error(`[Runner] Error executing step "${line}":`, err);
        break; // stop feature run on error
      }
    }
  }

  await browser.deleteSession();
  console.log('[Runner] Test run completed');
}

run().catch(err => console.error('[Runner] Error:', err));
