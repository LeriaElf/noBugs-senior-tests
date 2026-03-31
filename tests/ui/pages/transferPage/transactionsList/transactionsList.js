import { expect } from '@playwright/test';

export class TransactionsList {
  constructor(root) {
    this.root = root;
  }

  get transactionsListItems() {
    return this.root.locator('ul > li');
  }

  async titleIsVisible() {
    await expect(this.root.getByText('Matching Transactions', { exact: true })).toBeVisible();
    return this;
  }

  async getTransactionsText() {
    const transactions = await this.transactionsListItems.evaluateAll(items =>
      items.map(item =>
        Array.from(item.querySelectorAll('span'))
          .map(span => span.textContent?.trim() ?? '')
          .filter(Boolean),
      ),
    );

    return transactions;
  }

  normalizeTransaction(transactionParts) {
    const fullText = transactionParts.join(' ').replace(/\s+/g, ' ').trim();
    const typeMatch = fullText.match(/^[A-Z_]+/);
    const amountMatch = fullText.match(/(\d+(?:\.\d+)?)/);

    return {
      type: typeMatch?.[0] ?? '',
      amountValue: Number(amountMatch?.[1] ?? 0),
    };
  }

  async collectTransactionsData() {
    const transactionsTextMatrix = await this.getTransactionsText();

    return transactionsTextMatrix.map(transactionParts =>
      this.normalizeTransaction(transactionParts),
    );
  }

  normalizeApiTransaction(transaction) {
    return {
      type: transaction.type,
      amountValue: Number(Number(transaction.amount).toFixed(2)),
    };
  }

  async expectApiTransactionsToBeVisible(apiTransactions) {
    const expectedTransactions = apiTransactions.map(transaction =>
      this.normalizeApiTransaction(transaction),
    );
    const actualTransactions = await this.collectTransactionsData();

    for (const expectedTransaction of expectedTransactions) {
      expect(
        actualTransactions.some(
          ({ type, amountValue }) =>
            type === expectedTransaction.type && amountValue === expectedTransaction.amountValue,
        ),
        `Transaction "${expectedTransaction.type}" with amount "${expectedTransaction.amountValue}" was not found in UI`,
      ).toBe(true);
    }

    return this;
  }
}
