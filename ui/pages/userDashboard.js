import { BasePage } from "./basePage";
import { expect } from "@playwright/test";
import { URLS } from "../utils/urls.js";

export class UserDashboard extends BasePage {
  get url() {
    return URLS.DASHBOARD;
  }

  get welcomeText() {
    return this.page.locator(".welcome-text");
  }
  get createAccountButton() {
    return this.page.getByText("➕ Create New Account", { exact: true });
  }

  async createAccount() {
    await this.createAccountButton.click();
    return this;
  }

  async expectLoaded() {
    await expect(this.page.getByText("User Dashboard")).toBeVisible();
    return this;
  }
}
