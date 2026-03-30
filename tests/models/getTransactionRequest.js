import { BaseModel } from './baseModel.js';

export class GetTransactionRequest extends BaseModel {
  constructor({ accountId }) {
    super({ accountId });
  }
}
