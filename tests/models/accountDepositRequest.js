import { BaseModel } from './baseModel.js';
import { isApiVersion } from '../utils/apiVersion.js';

export class AccountDepositRequest extends BaseModel {
  constructor({ accountId, amount, id = accountId, balance = amount }) {
    super({ accountId, amount, id, balance });
  }

  toJson() {
    if (isApiVersion('with_validation_fix') || isApiVersion('with_fraud_check')) {
      return {
        accountId: this.accountId ?? this.id,
        amount: this.amount ?? this.balance,
      };
    }

    return {
      id: this.id ?? this.accountId,
      balance: this.balance ?? this.amount,
    };
  }

  static generateBalanceData() {
    const isDecimal = Math.random() < 0.5;
    if (isDecimal) {
      return Math.round((Math.random() * 4998 + 1) * 100) / 100;
    } else {
      return Math.floor(Math.random() * 5000) + 1;
    }
  }
}
