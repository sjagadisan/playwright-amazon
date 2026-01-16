import { Page } from '@playwright/test';

export class AmazonHomePage {
  readonly page: Page;
  readonly searchBox = 'input#twotabsearchtextbox'; // Amazon search box selector
  readonly searchButton = 'input#nav-search-submit-button'; // Amazon search button selector

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    // Add stealth-like scripts before navigation. Address Amazon bot detection when continue shopping appears on intermittent basis
    await this.addStealthScripts();
    await this.page.goto('https://www.amazon.com/');
    await this.handleBotDetection();
  }
  // Add stealth-like scripts to mask automation. This code will bypass Amazon BOT detection
  async addStealthScripts() {
    // Remove webdriver property
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    // Mock plugins and languages
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
  }

  // Handles bot detection popup if present
  async handleBotDetection() {
    // If a bot-detection URL or popup appears, handle it
    // Example: look for 'Continue shopping' button
    const continueButton = this.page.getByRole('button', { name: /continue shopping/i });
    try {
      // Wait up to 5 seconds for the button to appear
      await continueButton.waitFor({ timeout: 5000 });
      await continueButton.click();
    } catch (e) {
      // Button did not appear, continue as normal
    }
  }

  async searchFor(item: string) {
    await this.page.fill(this.searchBox, item);
    await this.page.click(this.searchButton);
  }

  // Select a product by index and return its price
  async selectProductByIndex(index: number) {
    const product = this.page.locator('div.s-main-slot div[data-component-type="s-search-result"]').nth(index);
    const productButton = await this.page.locator('#a-autoid-3-announce');
    await productButton.click();
    const price = await product.locator('span.a-price > span.a-offscreen').first().innerText();
    return { price };
  }

  // Get product locator by index
  getProductByIndex(index: number) {
    return this.page.locator('div.s-main-slot div[data-component-type="s-search-result"]').nth(index);
  }

  // Get price text for a product locator
  async getProductPrice(productLocator:any) {
    return await productLocator.locator('span.a-price > span.a-offscreen').first().innerText();
  }
}


