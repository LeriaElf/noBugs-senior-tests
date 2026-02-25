import { expect } from "@playwright/test";
import { AMOUNT_RE, ACCOUNT_RE } from "../../utils/patterns.js";
import { AccountDepositRequest } from "../../../seniorTests/models/accountDepositRequest.js";

export class AccountForm {
  constructor(page) {
    this.page = page;
  }

  get selectAccountOption() {
    return this.page.locator(
      "//select[./option[text() = '-- Choose an account --' ]]",
    );
  }

  get amountInput() {
    return this.page.getByPlaceholder("Enter amount");
  }

  get recipientNameInput() {
    return this.page.getByPlaceholder("Enter recipient name");
  }

  get recipientAccountInput() {
    return this.page.getByPlaceholder("Enter recipient account number");
  }

  async chooseAccount(accountNumber) {
    const value = String(accountNumber).replace(/^ACC/i, "");
    await this.selectAccountOption.selectOption(value);

    return this;
  }

  async enterAmount(amount) {
    amount = amount ?? AccountDepositRequest.generateBalanceData();
    await this.amountInput.fill(amount.toString());

    return amount;
  }

  async clearAmount() {
    await this.amountInput.clear();

    return this;
  }

  async getSelectedAccountBalance(accountNumber) {
    const accountId = accountNumber.replace("ACC", "");
    const text = await this.page
      .locator(`//option[@value="${accountId}"]`)
      .textContent();
    expect(text.match(ACCOUNT_RE)[1]).toBe(accountNumber);

    return text.match(AMOUNT_RE)?.[1];
  }

  async fillRecipientName(name) {
    await this.recipientNameInput.fill(name);

    return this;
  }

  async fillRecipientAccount(accountNumber) {
    await this.recipientAccountInput.fill(accountNumber);

    return this;
  }
}
