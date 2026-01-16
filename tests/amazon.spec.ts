import { test, expect } from '@playwright/test';
import { AmazonHomePage } from '../pom/AmazonHomePage.spec';
import testData from './testData.json';

const WAIT_VISIBLE_TIMEOUT = 15000;

test('Search TV in Amazon.com', async ({ page }) => {
  // Use the POM class for navigation and search. Amazon.com and Search for item from JSON
  const homePage = new AmazonHomePage(page);
  await homePage.goto();
  // Handle bot detection if it appears after navigation
  await homePage.handleBotDetection();
  await homePage.searchFor(testData.searchItem);

  // Select the 3rd product and get its price using POM methods
  const { price: fullPrice } = await homePage.selectProductByIndex(2);
  console.log('3rd product full price:', fullPrice);

  // This is  domcontentloaded for better cross-browser compatibility
  await page.waitForLoadState('domcontentloaded');

  // Ensure the cart is visible before interacting
  const cart = page.locator('#nav-cart');
  // Ensure the cart is visible and scroll into view
  await cart.scrollIntoViewIfNeeded();
  await cart.waitFor({ state: 'visible', timeout: WAIT_VISIBLE_TIMEOUT });
await expect(cart).toBeVisible();
await expect(cart).toBeEnabled();

  // Attempt to click the cart
  await cart.click();

  // Locator info of the SubTotal
  // 1. Wait for the specific container shown in your screenshot
  await page.waitForSelector('#sc-subtotal-amount-buybox', { state: 'visible', timeout: WAIT_VISIBLE_TIMEOUT });

  // 2. Use a locator that specifically targets the price span
  const cartPrice = page.locator('#sc-active-cart [class*="sc-price"]').nth(1);

  // 3. Assertion checks to make sure the price matches with 3rd item in the search criteria
  await expect(cartPrice).toContainText(fullPrice, { timeout: WAIT_VISIBLE_TIMEOUT });
});
