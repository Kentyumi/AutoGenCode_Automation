import { smart$ } from '../locator-brain/smart-element';
import type { Browser } from 'webdriverio';

export class BasePage {
  protected browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  private async resolve(logicalName: string): Promise<WebdriverIO.Element> {
    const elem = await smart$(this.browser, logicalName);

    // 🔥 auto scroll
    await elem.scrollIntoView();

    // optional safety
    await elem.waitForDisplayed({ timeout: 5000 });

    return elem;
  }

  async click(logicalName: string) {
    const elem = await this.resolve(logicalName);
    await elem.click();
  }

  async type(logicalName: string, value: string) {
    const elem = await this.resolve(logicalName);
    await elem.setValue(value);
  }

  async getText(logicalName: string): Promise<string> {
    const elem = await this.resolve(logicalName);
    return elem.getText();
  }

  async isDisplayed(logicalName: string): Promise<boolean> {
    const elem = await this.resolve(logicalName);
    return elem.isDisplayed();
  }
}
