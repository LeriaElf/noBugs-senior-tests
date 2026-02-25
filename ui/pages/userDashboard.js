import { BasePage } from "./basePage";
import { expect } from "@playwright/test";
import { URLS } from "../utils/urls.js";
import { Header } from "./elements/header.js";

export class UserDashboard extends BasePage {
  constructor(page) {
    super(page);
    this.header = new Header(this.page.locator("//header"));
  }

  get url() {
    return URLS.DASHBOARD;
  }

  get welcomeText() {
    return this.page.locator("//h2");
  }

  get createAccountButton() {
    return this.page.getByText("➕ Create New Account", { exact: true });
  }

  get depositMoneyButton() {
    return this.page.getByText("💰 Deposit Money", { exact: true });
  }

  get makeTransferButton() {
    return this.page.getByText("🔄 Make a Transfer", { exact: true });
  }

  async createAccount() {
    await this.createAccountButton.click();
    return this;
  }

  async clickDepositMoneyButton() {
    await this.depositMoneyButton.click();
    return this;
  }

  async clickTransferButton() {
    await this.makeTransferButton.click();
    return this;
  }

  async expectLoaded() {
    await expect(this.page.getByText("User Dashboard")).toBeVisible();
    return this;
  }

  async getWelcomeName() {
    const name = this.welcomeText.locator("//span");
    return name.innerText();
  }
}
