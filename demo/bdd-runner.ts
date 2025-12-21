import fs from 'fs';
import path from 'path';
import { remote, Browser } from 'webdriverio';
import { BasePage } from '../pages/base-page';
import { BASE_URL, TCS_DIR } from './config';
import { recorder } from '../codegen/execution-recorder';
import { generateTestCode } from '../codegen/code-generator';

// ---------- Utility: read all feature files ----------
function readTestCases(dir: string): { name: string; content: string }[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.feature'));
  return files.map(f => ({
    name: f.replace('.feature', ''),
    content: fs.readFileSync(path.join(dir, f), 'utf-8')
  }));
}

// ---------- Runner ----------
async function run() {
  const browser: Browser = await remote({
    logLevel: 'error',
    capabilities: { browserName: 'chrome' }
  });

  const page = new BasePage(browser);

  await browser.url(BASE_URL);

  const tcs = readTestCases(TCS_DIR);
  console.log(`[Runner] Loaded ${tcs.length} feature(s)`);

  for (const tc of tcs) {
    console.log(`\n[Runner] Running feature: ${tc.name}`);
    recorder.clear();

    let scenarioPassed = true;

    try {
      const lines = tc.content
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && !l.startsWith('Feature'));

      for (const line of lines) {
        if (line.startsWith('Scenario')) {
          console.log(`[Runner] ${line}`);
          continue;
        }

        if (line.startsWith('Given I enter')) {
          const match = line.match(/Given I enter "(.+)" into "(.+)"/);
          if (match) {
            const [, value, logicalName] = match;
            await page.type(logicalName, value);
            console.log(`[Runner] Entered "${value}" into "${logicalName}"`);
          }
        }

        else if (line.startsWith('When I click')) {
          const match = line.match(/When I click "(.+)"/);
          if (match) {
            const logicalName = match[1];
            await page.click(logicalName);
            console.log(`[Runner] Clicked "${logicalName}"`);
          }
        }

        else if (line.startsWith('Then I should see')) {
          const match = line.match(/Then I should see "(.+)" in "(.+)"/);
          if (match) {
            const [, expected, logicalName] = match;
            const text = await page.getText(logicalName);

            console.log(
              `[Runner] Assert "${logicalName}" contains "${expected}" → actual: "${text}"`
            );

            if (!text.includes(expected)) {
              throw new Error(
                `Assertion failed: "${logicalName}" does not contain "${expected}"`
              );
            }
          }
        }
      }

    } catch (err) {
      scenarioPassed = false;
      console.error(`[Runner] Scenario FAILED`);
      console.error(err);
    }

    // ---------- CodeGen only if PASS ----------
    if (scenarioPassed) {
      console.log(`[Runner] Scenario PASSED → generating code`);
      generateTestCode(tc.name, recorder.getSteps());
    } else {
      console.log(`[Runner] Scenario FAILED → code NOT generated`);
    }
  }

  await browser.deleteSession();
  console.log('\n[Runner] Test run completed');
}

// ---------- Execute ----------
run().catch(err => console.error('[Runner] Fatal Error:', err));
