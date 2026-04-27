import { BaseModel } from './baseModel.js';
import { AccountDepositResponse } from './accountDepositResponse.js';

export class CustomerAccountsResponse extends BaseModel {
  constructor(data) {
    const accountsArray = Array.isArray(data) ? data : data?.accounts ?? [];
    super({ accounts: accountsArray.map(acc => new AccountDepositResponse(acc)) });
  }
}
