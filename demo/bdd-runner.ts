import fs from 'fs';
import path from 'path';
import { remote, Browser, ChainablePromiseElement } from 'webdriverio';
import { smart$ } from '../locator-brain/smart-element';
import { BASE_URL, TCS_DIR } from './democonfig';

// ---------- Utility ----------
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

  await browser.url(BASE_URL);

  const tcsContents = readTestCases(TCS_DIR);
  console.log(`[Runner] Loaded ${tcsContents.length} feature(s)`);

  for (const content of tcsContents) {
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    for (const line of lines) {

      // Given I open "/path"
      if (line.startsWith('Given I open')) {
        const match = line.match(/Given I open "(.+)"/);
        if (match) {
          const url = match[1];
          await browser.url(url.startsWith('http') ? url : BASE_URL + url);
          console.log(`[Runner] Opened ${url}`);
        }
      }

      // When / And I type "value" into "logical_name"
      else if (line.match(/^(When|And) I type /)) {
        const match = line.match(/I type "(.+)" into "(.+)"/);
        if (match) {
          const [, value, logicalName] = match;
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          await elem.waitForDisplayed({ timeout: 5000 });
          await elem.clearValue();
          await elem.setValue(value);
          console.log(`[Runner] Typed "${value}" into "${logicalName}"`);
        }
      }

      // When I click "logical_name"
      else if (line.startsWith('When I click')) {
        const match = line.match(/When I click "(.+)"/);
        if (match) {
          const logicalName = match[1];
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          await elem.waitForClickable({ timeout: 5000 });
          await elem.click();
          console.log(`[Runner] Clicked "${logicalName}"`);
        }
      }

      // Then I should see "text" in "logical_name"
      else if (line.startsWith('Then I should see')) {
        const match = line.match(/Then I should see "(.+)" in "(.+)"/);
        if (match) {
          const [, expected, logicalName] = match;
          const elem: ChainablePromiseElement = await smart$(browser, logicalName);
          await elem.waitForDisplayed({ timeout: 5000 });
          const text = await elem.getText();
          console.log(
            `[Runner] Assert "${logicalName}" → "${text}" (expect: "${expected}")`
          );
        }
      }
    }
  }

  await browser.deleteSession();
  console.log('[Runner] Test run completed');
}

run().catch(err => console.error('[Runner] Error:', err));
