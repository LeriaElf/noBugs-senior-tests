import { BasePage } from './basePage';
import { expect } from '@playwright/test';
import { URLS } from '../utils/urls.js';
import { Header } from './elements/header.js';

export class ProfilePage extends BasePage {
  constructor(page) {
    super(page);
    this.header = new Header(this.page.locator('//header'));
  }

  get url() {
    return URLS.PROFILE;
  }

  get nameInput() {
    return this.page.getByPlaceholder('Enter new name', { exact: true });
  }

  get saveButton() {
    return this.page.getByText('💾 Save Changes', { exact: true });
  }

  async expectLoaded() {
    await expect(this.page.getByText('✏️ Edit Profile')).toBeVisible();
    return this;
  }

  // BUG: useEffect в EditProfile не игнорирует устаревшие ответы при ремаунте (StrictMode),
  // из-за чего setNewName() может затереть ввод. Нужен cleanup (ignore-флаг или AbortController).

  async fillName(name) {
    await expect(async () => {
      await this.nameInput.clear();
      await this.nameInput.pressSequentially(name, { delay: 50 });
      await expect(this.nameInput).toHaveValue(name, { timeout: 500 });
    }).toPass({ timeout: 10_000 });
    return this;
  }

  async saveButtonClick() {
    await this.saveButton.click();
    return this;
  }
}
