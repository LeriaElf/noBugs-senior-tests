import { BaseModel } from './baseModel.js';
import { Transaction } from './transaction.js';

export class GetTransactionResponse extends BaseModel {
  constructor(data) {
    const arrayTransactions = Array.isArray(data) ? data : data?.transactions ?? [];
    super({
      transactions: arrayTransactions.map(transaction => new Transaction(transaction)),
    });
  }
}
