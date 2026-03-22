import { BasePage } from './basePage';
import { expect } from '@playwright/test';
import { UserBadge } from '../pages/elements/userBadge.js';
import { URLS } from '../utils/urls.js';

export class AdminPanel extends BasePage {
  get url() {
    return URLS.ADMIN;
  }

  get addUserButton() {
    return this.page.getByText('Add User', { exact: true });
  }

  get adminPanelMessage() {
    return this.page.getByText('Admin Panel', { exact: true });
  }

  get listRoot() {
    return this.page.getByText('All Users', { exact: true }).locator('..');
  }

  get listItems() {
    return this.listRoot.locator('li');
  }

  async createUser(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.addUserButton.click();

    return this;
  }

  async expectAdminPanelVisible() {
    await expect(this.adminPanelMessage).toBeVisible();
    return this;
  }

  rowByUsername(username) {
    return this.listRoot.locator(`//li[text() = '${username}']`);
  }

  async expectUserIsVisible(username, timeout = 10_000) {
    const row = this.rowByUsername(username);
    await expect(row).toHaveCount(1, { timeout });

    return this;
  }

  async expectUserNotToExist(username, timeout = 10_000) {
    const row = this.rowByUsername(username);
    await expect(row).toHaveCount(0, { timeout });

    return this;
  }

  async getAllUsers() {
    const count = await this.listItems.count();

    return Array.from({ length: count }, (_, i) => new UserBadge(this.listItems().nth(i)));
  }
}
