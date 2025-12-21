// locator-brain/dom-scanner.ts
import type { Browser } from 'webdriverio';

export interface DomElementInfo {
  tag: string;
  id?: string;
  name?: string;
  className?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  attributes: Record<string, string>;
}

/**
 * Scan the entire DOM and collect all interactive elements
 */
export async function scanDom(browser: Browser): Promise<DomElementInfo[]> {
  return await browser.execute(() => {
    const elements = Array.from(document.querySelectorAll(
      'input, button, select, textarea, a, span, div'
    ));
    return elements.map(el => {
      const attributes: Record<string,string> = {};
      for (let attr of el.attributes) {
        attributes[attr.name] = attr.value;
      }
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        name: (el as HTMLInputElement).name || undefined,
        className: el.className || undefined,
        text: el.textContent?.trim() || undefined,
        placeholder: (el as HTMLInputElement).placeholder || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
        attributes
      } as DomElementInfo;
    });
  });
}
