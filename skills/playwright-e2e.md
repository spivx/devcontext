---
name: Playwright E2E Tests
description: Write end-to-end tests using Playwright.
dependencies: "@playwright/test"
---

## Guidelines
- Use page objects where complex interactions occur.
- Test user-visible behavior (clicks, navigation).
- Use distinct locators (test-id preferred).

## Template
\`\`\`typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should allow user to login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
  });
});
\`\`\`
