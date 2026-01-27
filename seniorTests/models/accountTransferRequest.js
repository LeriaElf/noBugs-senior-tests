import { BaseModel } from "./baseModel.js";

export class AccountTransferRequest extends BaseModel {
  constructor({ senderAccountId, receiverAccountId, amount }) {
    super({ senderAccountId, receiverAccountId, amount });
  }

  static generateTranferData() {
    const isDecimal = Math.random() < 0.5;
    if (isDecimal) {
      return Math.round((Math.random() * 9998 + 1) * 100) / 100;
    } else {
      return Math.floor(Math.random() * 10000) + 1;
    }
  }
}
