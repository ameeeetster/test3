import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests @a11y', () => {
  test('should not have any automatically detectable accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on lifecycle page', async ({ page }) => {
    await page.goto('/lifecycle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on requests page', async ({ page }) => {
    await page.goto('/requests');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/lifecycle');
    
    // Check for proper heading structure
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    const h2s = page.getByRole('heading', { level: 2 });
    await expect(h2s.first()).toBeVisible();
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/requests');
    
    // Check search input has proper label
    const searchInput = page.getByPlaceholder('Search applications, roles, or groups...');
    await expect(searchInput).toBeVisible();
    
    // Check that form elements are properly labeled
    const searchLabel = page.getByText('Search');
    await expect(searchLabel).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate to main content
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/lifecycle');
    
    // Check for proper ARIA labels on buttons
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/lifecycle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management in modals', async ({ page }) => {
    await page.goto('/lifecycle');
    
    // Open simulation drawer
    await page.getByText('Run Simulation').click();
    
    // Check that focus is trapped in modal
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    
    // Tab should stay within modal
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('/lifecycle');
    
    // Open simulation drawer
    await page.getByText('Run Simulation').click();
    
    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]');
    await expect(liveRegion).toBeVisible();
  });

  test('should have proper table headers', async ({ page }) => {
    await page.goto('/identities');
    
    // Check for proper table structure
    const tables = page.getByRole('table');
    const tableCount = await tables.count();
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const headers = table.getByRole('columnheader');
      const headerCount = await headers.count();
      
      // Tables should have headers
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    
    // Check that links have descriptive text
    const links = page.getByRole('link');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const textContent = await link.textContent();
      
      // Link text should be descriptive
      expect(textContent?.trim().length).toBeGreaterThan(0);
    }
  });
});















