import { BaseModel } from './baseModel.js';

export class AccountTransferResponse extends BaseModel {
  constructor({
    status,
    receiverAccountId,
    senderAccountId,
    message,
    amount,
    fraudRiskScore,
    fraudReason,
    requiresManualReview,
    requiresVerification,
  }) {
    super({
      status,
      receiverAccountId,
      senderAccountId,
      message,
      amount,
      fraudRiskScore,
      fraudReason,
      requiresManualReview,
      requiresVerification,
    });
  }
}
