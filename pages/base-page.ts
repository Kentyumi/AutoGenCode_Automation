import { smart$ } from '../locator-brain/smart-element';
import type { Browser } from 'webdriverio';
import { recorder } from '../codegen/execution-recorder';
import { getLocator } from '../locator-brain/registry';

export class BasePage {
  protected browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async click(logicalName: string) {
    const elem = await smart$(this.browser, logicalName);
    await elem.click();

    recorder.record({
      action: 'click',
      logicalName,
      selector: getLocator(logicalName)!
    });
  }

  async type(logicalName: string, value: string) {
    const elem = await smart$(this.browser, logicalName);
    await elem.setValue(value);

    recorder.record({
      action: 'type',
      logicalName,
      value,
      selector: getLocator(logicalName)!
    });
  }
}
