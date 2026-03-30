import { BasePage } from './basePage.js';
import { expect } from '@playwright/test';
import { URLS } from '../utils/urls.js';
import { AccountForm } from './elements/accountForm.js';

export class TransferPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountForm = new AccountForm(page);
  }

  get url() {
    return URLS.TRANSFER;
  }

  get confirmCheckbox() {
    return this.page.locator("//input[@id = 'confirmCheck']");
  }

  get transferAgainButton() {
    return this.page.getByText('🔁 Transfer Again', { exact: true });
  }

  get transferButton() {
    return this.page.getByText('🚀 Send Transfer', { exact: true });
  }

  get homeButton() {
    return this.page.getByText('🏠 Home', { exact: true });
  }

  async confirmCheckboxClick() {
    await this.confirmCheckbox.click();
    return this;
  }

  async checkboxIsChecked() {
    return await this.confirmCheckbox.isChecked();
  }

  async clickTransferButton() {
    await this.transferButton.click();
    return this;
  }

  async clickTransferAgainButton() {
    await this.transferAgainButton.click();
    return this;
  }

  async clickHomeButton() {
    await this.homeButton.click();
    return this;
  }

  async titleIsVisible() {
    await expect(this.page.getByText('🔄 Make a Transfer', { exact: true })).toBeVisible();

    return this;
  }
}
