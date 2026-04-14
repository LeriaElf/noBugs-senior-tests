import { BaseModel } from './baseModel.js';
import { Transaction } from './transaction.js';

export class AccountDepositResponse extends BaseModel {
  constructor({ id, accountNumber, balance, transactions = [] }) {
    super({ id, accountNumber, balance });
    this.transactions = transactions.map(t => new Transaction(t));
  }
}
