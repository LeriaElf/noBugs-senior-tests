import { BaseModel } from './baseModel.js';

export class Transaction extends BaseModel {
  constructor({ id, amount, type, timestamp, relatedAccountId, accountId, ...rest }) {
    super({
      id,
      amount,
      type,
      timestamp,
      relatedAccountId: relatedAccountId ?? accountId ?? null,
      ...rest,
    });
  }
}
