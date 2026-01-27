import { test, expect } from '@playwright/test'

test.describe('Skills Marketplace', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/skills')
    })

    test('should load the skills marketplace page', async ({ page }) => {
        await expect(page.getByTestId('skills-page')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Skills Marketplace' })).toBeVisible()
        await expect(page.getByTestId('skill-search-input')).toBeVisible()
    })

    test('should filter skills by search query', async ({ page }) => {
        await page.getByTestId('skill-search-input').fill('react')

        const cards = page.locator('[data-testid^="skill-card-"]')
        const count = await cards.count()

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                const text = await cards.nth(i).textContent()
                expect(text?.toLowerCase()).toContain('react')
            }
        }
    })

    test('should open skill drawer when clicking a skill card', async ({ page }) => {
        const firstCard = page.locator('[data-testid^="skill-card-"]').first()
        await expect(firstCard).toBeVisible()

        const skillName = await firstCard.locator('h3').textContent()
        await firstCard.click()

        await expect(page.getByTestId('skill-drawer')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Edit Skill' })).toBeVisible()

        await expect(page.locator('#name')).toHaveValue(skillName || '')
    })

    test('should switch between editor and preview tabs', async ({ page }) => {
        await page.getByTestId('create-custom-skill-button').click()
        await expect(page.getByTestId('skill-drawer')).toBeVisible()

        // Default should be editor
        await expect(page.getByTestId('skill-content-input')).toBeVisible()

        // Switch to preview
        await page.getByTestId('preview-tab-button').click()
        await expect(page.getByTestId('skill-preview-content')).toBeVisible()
        await expect(page.getByTestId('skill-content-input')).not.toBeVisible()

        // Switch back to editor
        await page.getByTestId('editor-tab-button').click()
        await expect(page.getByTestId('skill-content-input')).toBeVisible()
        await expect(page.getByTestId('skill-preview-content')).not.toBeVisible()
    })

    test('should be able to close the drawer', async ({ page }) => {
        await page.getByTestId('create-custom-skill-button').click()
        await expect(page.getByTestId('skill-drawer')).toBeVisible()

        await page.getByTestId('close-drawer-button').click()
        await expect(page.getByTestId('skill-drawer')).not.toBeVisible()
    })

    test('should allow creating a custom skill', async ({ page }) => {
        await page.getByTestId('create-custom-skill-button').click()
        await expect(page.getByTestId('skill-drawer')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Create New Skill' })).toBeVisible()

        await page.locator('#name').fill('New Test Skill')
        await page.locator('#description').fill('A description for the test skill')
        await page.getByTestId('skill-content-input').fill('## Test Content')

        // Switch to preview to verify
        await page.getByTestId('preview-tab-button').click()
        const previewContent = await page.getByTestId('skill-preview-content').textContent()
        expect(previewContent).toContain('New Test Skill')
        expect(previewContent).toContain('A description for the test skill')
        expect(previewContent).toContain('## Test Content')
    })
})
