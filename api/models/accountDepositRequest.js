import { BaseModel } from "./baseModel.js";

export class AccountDepositRequest extends BaseModel {
  constructor({ id, balance }) {
    super({ id, balance });
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
