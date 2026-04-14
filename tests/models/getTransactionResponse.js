import { BaseModel } from './baseModel.js';
import { Transaction } from './transaction.js';

export class GetTransactionResponse extends BaseModel {
  constructor(arrayTransactions) {
    super({
      transactions: arrayTransactions.map(transaction => new Transaction(transaction)),
    });
  }
}
