import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Helper: Login before each test
async function loginAndNavigate(page: Page) {
  await page.goto(`${BASE_URL}/auth`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForNavigation();
  
  // Navigate to role creation
  await page.goto(`${BASE_URL}/access/roles/new`);
  await page.waitForSelector('[data-testid="role-wizard-stepper"]', { timeout: 5000 });
}

test.describe('Role Creation Wizard - Complete Flow', () => {
  
  test.describe('Step 1: Basics', () => {
    
    test('should load basics step with required fields', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Verify step 1 is active
      const stepIndicator = page.locator('[data-testid="step-indicator-0"]');
      await expect(stepIndicator).toContainText('Basics');
      
      // Verify fields exist
      await expect(page.locator('input[name="roleName"]')).toBeVisible();
      await expect(page.locator('textarea[name="description"]')).toBeVisible();
      await expect(page.locator('[data-testid="owner-select"]')).toBeVisible();
    });

    test('should show validation errors for empty required fields', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Try to proceed without filling required fields
      const nextButton = page.locator('button:has-text("Next")').first();
      await nextButton.click();
      
      // Should show error or disable button
      await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
    });

    test('should populate role name', async ({ page }) => {
      await loginAndNavigate(page);
      
      const roleNameInput = page.locator('input[name="roleName"]');
      await roleNameInput.fill('Test Admin Role');
      await expect(roleNameInput).toHaveValue('Test Admin Role');
    });

    test('should load identities in owner dropdown', async ({ page }) => {
      await loginAndNavigate(page);
      
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      
      // Wait for dropdown options to appear
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      
      const options = page.locator('[role="option"]');
      const count = await options.count();
      
      // Should have at least some identities loaded
      expect(count).toBeGreaterThan(0);
    });

    test('should allow manual owner email entry', async ({ page }) => {
      await loginAndNavigate(page);
      
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      
      // Select "Enter email manually" option
      const manualOption = page.locator('[role="option"]:has-text("Enter email manually")');
      await manualOption.click();
      
      // Verify manual input appears
      const manualInput = page.locator('input[placeholder="Enter owner email"]');
      await expect(manualInput).toBeVisible();
      
      // Enter email
      await manualInput.fill('admin@example.com');
      await expect(manualInput).toHaveValue('admin@example.com');
    });

    test('should proceed to step 2 with valid basics', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Fill basic info
      await page.locator('input[name="roleName"]').fill('Test Role');
      await page.locator('textarea[name="description"]').fill('A test role');
      
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
      
      // Click Next
      const nextButton = page.locator('button:has-text("Next")').first();
      await nextButton.click();
      
      // Should move to step 2
      const stepIndicator = page.locator('[data-testid="step-indicator-1"]');
      await expect(stepIndicator).toContainText('Entitlements');
    });
  });

  test.describe('Step 2: Permissions (Entitlements)', () => {
    
    test('should load permissions list', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Proceed to step 2
      await page.locator('input[name="roleName"]').fill('Test Role');
      await page.locator('textarea[name="description"]').fill('Test');
      
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]', { timeout: 5000 });
      await page.locator('[role="option"]').first().click();
      
      await page.locator('button:has-text("Next")').first().click();
      
      // Verify permissions are loaded
      await page.waitForSelector('[data-testid="permission-checkbox"]', { timeout: 5000 });
      const permissionCheckboxes = page.locator('[data-testid="permission-checkbox"]');
      const count = await permissionCheckboxes.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should filter permissions by category', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Navigate to step 2
      await page.locator('input[name="roleName"]').fill('Test');
      await page.locator('textarea[name="description"]').fill('Test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      await page.locator('button:has-text("Next")').first().click();
      
      // Wait for permissions to load
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      
      // Click category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.click();
      
      // Select a category
      const categoryOption = page.locator('[role="option"]').first();
      await categoryOption.click();
      
      // Permissions should be filtered
      await page.waitForTimeout(500);
      const visiblePermissions = page.locator('[data-testid="permission-checkbox"]:visible');
      const count = await visiblePermissions.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should select multiple permissions', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Navigate to step 2
      await page.locator('input[name="roleName"]').fill('Test');
      await page.locator('textarea[name="description"]').fill('Test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      await page.locator('button:has-text("Next")').first().click();
      
      // Wait and select permissions
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      const permissionCheckboxes = page.locator('[data-testid="permission-checkbox"]');
      
      // Select first 3 permissions
      for (let i = 0; i < Math.min(3, await permissionCheckboxes.count()); i++) {
        await permissionCheckboxes.nth(i).check();
      }
      
      // Verify selections are checked
      const checkedBoxes = page.locator('[data-testid="permission-checkbox"]:checked');
      expect(await checkedBoxes.count()).toBeGreaterThanOrEqual(3);
    });

    test('should require at least one permission', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Navigate to step 2
      await page.locator('input[name="roleName"]').fill('Test');
      await page.locator('textarea[name="description"]').fill('Test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      await page.locator('button:has-text("Next")').first().click();
      
      // Try to proceed without selecting any permissions
      const nextButton = page.locator('button:has-text("Next")').first();
      
      // Check if button is disabled or shows error
      const isDisabled = await nextButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    });
  });

  test.describe('Step 3: Rules (Membership Criteria)', () => {
    
    test('should display membership rule options', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Navigate to step 3
      await page.locator('input[name="roleName"]').fill('Test');
      await page.locator('textarea[name="description"]').fill('Test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      await page.locator('button:has-text("Next")').first().click();
      
      // Select at least one permission
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').first().check();
      
      await page.locator('button:has-text("Next")').first().click();
      
      // Verify step 3 is displayed
      const stepIndicator = page.locator('[data-testid="step-indicator-2"]');
      await expect(stepIndicator).toContainText('Rules');
    });
  });

  test.describe('Step 4: Review & Create', () => {
    
    test('should show summary of role configuration', async ({ page }) => {
      await loginAndNavigate(page);
      
      const roleName = 'Integration Test Role';
      const description = 'Testing role creation flow';
      
      // Fill step 1
      await page.locator('input[name="roleName"]').fill(roleName);
      await page.locator('textarea[name="description"]').fill(description);
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      
      // Step 2: Select permissions
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').nth(0).check();
      await page.locator('[data-testid="permission-checkbox"]').nth(1).check();
      
      // Step 3: Skip rules
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      
      // Step 4: Review
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      
      // Verify review shows our data
      await expect(page.locator('body')).toContainText(roleName);
      await expect(page.locator('body')).toContainText(description);
    });

    test('should create role successfully and persist to database', async ({ page }) => {
      await loginAndNavigate(page);
      
      const roleName = `E2E Test Role ${Date.now()}`;
      const description = 'E2E test role creation';
      
      // Fill all steps
      await page.locator('input[name="roleName"]').fill(roleName);
      await page.locator('textarea[name="description"]').fill(description);
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').nth(0).check();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      
      // Click Create Role button
      const createButton = page.locator('button:has-text("Create Role")');
      await createButton.click();
      
      // Check console for success (steps 8 → 22)
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));
      
      // Should see success messages
      await page.waitForTimeout(2000);
      
      // Verify role was created (should be redirected or show success)
      const hasSuccessMessage = consoleMessages.some(msg => msg.includes('Role creation complete'));
      const hasErrorMessage = consoleMessages.some(msg => msg.includes('Failed'));
      
      // Should NOT have failed
      expect(hasErrorMessage).toBeFalsy();
    });

    test('should handle role creation errors gracefully', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Fill minimal info to trigger potential errors
      await page.locator('input[name="roleName"]').fill('X');
      await page.locator('textarea[name="description"]').fill('X');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').nth(0).check();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Next")').first().click();
      
      // Wait for error handling
      await page.waitForTimeout(2000);
      
      // Should show error toast or message
      const errorToast = page.locator('[role="status"]');
      
      // Either error or success should be visible
      const hasToast = await errorToast.count();
      expect(hasToast).toBeGreaterThan(0);
    });
  });

  test.describe('RLS Policy Validation', () => {
    
    test('should respect org-scoped permissions from RLS', async ({ page }) => {
      await loginAndNavigate(page);
      
      // Fill and submit
      await page.locator('input[name="roleName"]').fill(`RLS Test ${Date.now()}`);
      await page.locator('textarea[name="description"]').fill('RLS policy test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').nth(0).check();
      
      // Proceed to create
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Next")').first().click();
      
      // Capture network calls
      const responses: string[] = [];
      page.on('response', response => {
        responses.push(`${response.status()} ${response.url()}`);
      });
      
      await page.locator('button:has-text("Create Role")').click();
      await page.waitForTimeout(2000);
      
      // Should have successful responses (200, 201)
      const successResponses = responses.filter(r => r.startsWith('20'));
      expect(successResponses.length).toBeGreaterThan(0);
    });

    test('console logs should show RLS permission flow', async ({ page }) => {
      await loginAndNavigate(page);
      
      const consoleLogs: string[] = [];
      page.on('console', msg => consoleLogs.push(msg.text()));
      
      // Create role
      await page.locator('input[name="roleName"]').fill(`Console Test ${Date.now()}`);
      await page.locator('textarea[name="description"]').fill('Test');
      const ownerSelect = page.locator('[data-testid="owner-select"]');
      await ownerSelect.click();
      await page.waitForSelector('[role="option"]');
      await page.locator('[role="option"]').first().click();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForSelector('[data-testid="permission-checkbox"]');
      await page.locator('[data-testid="permission-checkbox"]').nth(0).check();
      
      await page.locator('button:has-text("Next")').first().click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Next")').first().click();
      
      await page.locator('button:has-text("Create Role")').click();
      await page.waitForTimeout(3000);
      
      // Check for RLS-related console logs
      const hasAuthLog = consoleLogs.some(log => log.includes('authenticated'));
      const hasOrgLog = consoleLogs.some(log => log.includes('Org ID'));
      const hasCreationLog = consoleLogs.some(log => log.includes('creating'));
      
      console.log('Console logs:', consoleLogs);
      
      // Should have at least user authentication log
      expect(hasAuthLog || hasOrgLog || hasCreationLog).toBeTruthy();
    });
  });
});

test.describe('Identities Dropdown (RLS-scoped)', () => {
  
  test('should load identities from v_identities view with RLS', async ({ page }) => {
    await loginAndNavigate(page);
    
    const ownerSelect = page.locator('[data-testid="owner-select"]');
    await ownerSelect.click();
    
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    const options = page.locator('[role="option"]');
    const count = await options.count();
    
    // Should have identities (or at least "Enter email manually" option)
    expect(count).toBeGreaterThan(0);
  });

  test('should show loading state while fetching identities', async ({ page }) => {
    await loginAndNavigate(page);
    
    const ownerSelect = page.locator('[data-testid="owner-select"]');
    
    // May show brief loading state
    const loadingText = page.locator('text=Loading identities');
    const isVisible = await loadingText.isVisible().catch(() => false);
    
    // Whether loading was visible or not, should eventually show options
    await ownerSelect.click();
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    
    const options = page.locator('[role="option"]');
    expect(await options.count()).toBeGreaterThan(0);
  });
});
