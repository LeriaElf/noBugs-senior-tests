import { BaseModel } from './baseModel.js';

export class DepositResponse extends BaseModel {
  constructor({ id, accountNumber, balance, depositAmount, transactionId, transactions = [] }) {
    super({ id, accountNumber, balance, depositAmount, transactionId, transactions });
  }
}
