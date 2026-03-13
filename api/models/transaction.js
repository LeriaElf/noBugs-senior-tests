import { BaseModel } from './baseModel.js';

export class Transaction extends BaseModel {
  constructor({ id, amount, type, timestamp, relatedAccountId }) {
    super({ id, amount, type, timestamp, relatedAccountId });
  }
}
