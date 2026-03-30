import { BasePage } from './basePage.js';
import { expect } from '@playwright/test';
import { URLS } from '../utils/urls.js';
import { AccountForm } from './elements/accountForm.js';

export class DepositPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountForm = new AccountForm(page);
  }

  get url() {
    return URLS.DEPOSIT;
  }

  get depositButton() {
    return this.page.getByText('💵 Deposit', { exact: true });
  }

  async titleIsVisible() {
    await expect(this.page.getByText('💰 Deposit Money', { exact: true })).toBeVisible();
    return this;
  }

  async clickDepositButton() {
    await this.depositButton.click();
    return this;
  }
}
