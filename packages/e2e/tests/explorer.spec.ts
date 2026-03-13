import { test, expect } from '@playwright/test'
import { ExplorerPage } from './pages/ExplorerPage'

test.describe('File Explorer', () => {
    let explorerPage: ExplorerPage

    test.beforeEach(async ({ page }) => {
        explorerPage = new ExplorerPage(page)
        await explorerPage.goto()
        await explorerPage.waitForTree()
    })

    test.describe('Initial Load', () => {
        test('should display the app title', async ({ page }) => {
            await expect(page.locator('header')).toContainText('File Explorer')
        })

        test('should display root folders in left panel', async ({ page }) => {
            await expect(page.locator('aside')).toContainText('Documents')
            await expect(page.locator('aside')).toContainText('Pictures')
            await expect(page.locator('aside')).toContainText('Downloads')
        })

        test('should show empty state in right panel on load', async ({ page }) => {
            await expect(page.locator('section')).toContainText('Select a folder to view its contents')
        })

        test('should show Ready in status bar', async ({ page }) => {
            await expect(page.locator('footer')).toContainText('Ready')
        })

        test('should display search bar', async ({ page }) => {
            await expect(page.locator('input[placeholder="Search..."]')).toBeVisible()
        })
    })

    test.describe('Folder Tree', () => {
        test('should expand folder on click', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('aside')).toContainText('Work')
            await expect(page.locator('aside')).toContainText('Personal')
        })

        test('should collapse folder on second click', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('aside')).toContainText('Work')

            await explorerPage.clickFolder('Documents')
            await expect(page.locator('aside')).not.toContainText('Work')
        })

        test('should expand nested folders', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await explorerPage.clickFolder('Work')
            await expect(page.locator('aside')).toContainText('Projects')
            await expect(page.locator('aside')).toContainText('Reports')
        })

        test('should highlight selected folder', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            const folder = await explorerPage.getFolderByName('Documents')
            await expect(folder).toHaveClass(/bg-explorer-active/)
        })
    })

    test.describe('Right Panel', () => {
        test('should show folder contents on click', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('section')).toContainText('Work')
            await expect(page.locator('section')).toContainText('Personal')
        })

        test('should show correct folder name in right panel header', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('section .border-b')).toContainText('Documents')
        })

        test('should update status bar with path', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('footer')).toContainText('/Documents')
        })

        test('should show files and folders separately', async ({ page }) => {
            await explorerPage.clickFolder('Downloads')
            await expect(page.locator('section')).toContainText('Folders')
            await expect(page.locator('section')).toContainText('Files')
        })

        test('should show item count in right panel header', async ({ page }) => {
            await explorerPage.clickFolder('Downloads')
            await expect(page.locator('section .border-b')).toContainText('items')
        })
    })

    test.describe('Search', () => {
        test('should show search results when typing', async ({ page }) => {
            await explorerPage.search('Documents')
            await expect(page.locator('aside')).toContainText('Documents')
            await expect(page.locator('aside')).toContainText('/Documents')
        })

        test('should show no results message for unknown query', async ({ page }) => {
            await explorerPage.search('zzznomatch')
            await expect(page.locator('aside')).toContainText('No results for')
        })

        test('should show search mode label in left panel', async ({ page }) => {
            await explorerPage.search('Work')
            await expect(page.locator('aside')).toContainText('Search:')
        })

        test('should restore folder tree after clearing search', async ({ page }) => {
            await explorerPage.search('Work')
            await expect(page.locator('aside')).toContainText('Search:')

            await page.locator('input[placeholder="Search..."]').fill('')
            await page.waitForTimeout(300)

            await expect(page.locator('aside')).toContainText('Folders')
        })
    })

    test.describe('Breadcrumb', () => {
        test('should show breadcrumb when folder is selected', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await expect(page.locator('header')).toContainText('Documents')
        })

        test('should update breadcrumb for nested folder', async ({ page }) => {
            await explorerPage.clickFolder('Documents')
            await explorerPage.clickFolder('Work')
            await expect(page.locator('header')).toContainText('Documents')
            await expect(page.locator('header')).toContainText('Work')
        })
    })
})