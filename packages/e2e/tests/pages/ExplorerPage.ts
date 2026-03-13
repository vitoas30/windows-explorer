import type { Page, Locator } from '@playwright/test'

// Page Object Model - encapsulates page interactions
// Makes tests more readable and maintainable
export class ExplorerPage {
  readonly page: Page

  // Left panel
  readonly leftPanel: Locator
  readonly folderTree: Locator

  // Right panel
  readonly rightPanel: Locator
  readonly rightPanelHeader: Locator

  // Search
  readonly searchInput: Locator

  // Status bar
  readonly statusBar: Locator

  // Resize handle
  readonly resizeHandle: Locator

  constructor(page: Page) {
    this.page = page
    this.leftPanel = page.locator('aside')
    this.folderTree = page.locator('aside ul')
    this.rightPanel = page.locator('section')
    this.rightPanelHeader = page.locator('section .border-b span').first()
    this.searchInput = page.locator('input[placeholder="Search..."]')
    this.statusBar = page.locator('footer')
    this.resizeHandle = page.locator('.cursor-col-resize')
  }

  async goto() {
    await this.page.goto('/')
  }

  async waitForTree() {
    await this.page.waitForSelector('aside ul li', { timeout: 10000 })
  }

  async getFolderByName(name: string): Promise<Locator> {
    return this.page.locator(`aside button`).filter({ hasText: name }).first()
  }

  async clickFolder(name: string) {
    const folder = await this.getFolderByName(name)
    await folder.click()
  }

  async getRightPanelItems(): Promise<Locator> {
    return this.rightPanel.locator('.w-24')
  }

  async getRightPanelFolders(): Promise<Locator> {
    return this.rightPanel.locator('.w-24').filter({ has: this.page.locator('.text-yellow-400') })
  }

  async search(query: string) {
    await this.searchInput.fill(query)
  }

  async clearSearch() {
    await this.searchInput.clear()
    const clearBtn = this.page.locator('button').filter({ has: this.page.locator('svg') }).last()
    await clearBtn.click()
  }

  async getStatusBarText(): Promise<string> {
    return await this.statusBar.textContent() ?? ''
  }
}