import { BaseModel } from './baseModel.js';

export class AccountTransferResponse extends BaseModel {
  constructor({ receiverAccountId, senderAccountId, message, amount }) {
    super({ receiverAccountId, senderAccountId, message, amount });
  }
}
