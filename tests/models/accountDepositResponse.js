import { BaseModel } from './baseModel.js';
import { Transaction } from './transaction.js';

export class AccountDepositResponse extends BaseModel {
  constructor(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      super({ raw: data });
      this.transactions = [];
      return;
    }

    const { id, accountNumber, balance, transactions = [] } = data;
    super({ id, accountNumber, balance });
    this.transactions = transactions.map(
      t => new Transaction({ ...t, relatedAccountId: t.relatedAccountId ?? t.accountId ?? id }),
    );
  }
}
