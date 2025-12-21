import fs from 'fs';
import path from 'path';
import { remote, Browser, ChainablePromiseElement } from 'webdriverio';
import { smart$ } from '../locator-brain/smart-element';
import { BasePage } from '../pages/base-page';
import { BASE_URL, TCS_DIR } from './config';


// ---------- Utility: read all feature files ----------
function readTestCases(dir: string): string[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.feature'));
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf-8'));
}

// ---------- Runner ----------
async function run() {
  const browser: Browser = await remote({
    logLevel: 'error',
    capabilities: { browserName: 'chrome' }
  });

  const basePage = new BasePage(browser);

  await browser.url(BASE_URL);

  const tcsContents = readTestCases(TCS_DIR);
  console.log(`[Runner] Loaded ${tcsContents.length} feature(s)`);

  for (const content of tcsContents) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

    for (const line of lines) {
      if (line.startsWith('Given I enter')) {
        const match = line.match(/Given I enter "(.+)" into "(.+)"/);
        if (match) {
          const [, value, logicalName] = match;
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          await elem.setValue(value);
          console.log(`[Runner] Entered "${value}" into "${logicalName}"`);
        }
      } else if (line.startsWith('When I click')) {
        const match = line.match(/When I click "(.+)"/);
        if (match) {
          const logicalName = match[1];
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          await elem.click();
          console.log(`[Runner] Clicked "${logicalName}"`);
        }
      } else if (line.startsWith('Then I should see')) {
        const match = line.match(/Then I should see "(.+)" in "(.+)"/);
        if (match) {
          const [, expected, logicalName] = match;
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          const text = await elem.getText();
          console.log(`[Runner] "${logicalName}" text = "${text}", expected = "${expected}"`);
        }
      }
    }
  }

  await browser.deleteSession();
  console.log('[Runner] Test run completed');
}

// ---------- Execute ----------
run().catch(err => console.error('[Runner] Error:', err));
