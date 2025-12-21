import { smart$ } from '../locator-brain/smart-element';
import type { Browser, ChainablePromiseElement } from 'webdriverio';

export class BasePage {
  protected browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async click(logicalName: string) {
    const elem: ChainablePromiseElement = await smart$(this.browser, logicalName);
    await elem.click();
  }

  async type(logicalName: string, value: string) {
    const elem: ChainablePromiseElement = await smart$(this.browser, logicalName);
    await elem.setValue(value);
  }

  async getText(logicalName: string): Promise<string> {
    const elem: ChainablePromiseElement = await smart$(this.browser, logicalName);
    return elem.getText();
  }

  async isDisplayed(logicalName: string): Promise<boolean> {
    const elem: ChainablePromiseElement = await smart$(this.browser, logicalName);
    return elem.isDisplayed();
  }
}
