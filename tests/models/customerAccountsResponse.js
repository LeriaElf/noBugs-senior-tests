import { BaseModel } from './baseModel.js';
import { AccountDepositResponse } from './accountDepositResponse.js';

export class CustomerAccountsResponse extends BaseModel {
  constructor(accountsArray) {
    super({ accounts: accountsArray.map(acc => new AccountDepositResponse(acc)) });
  }
}
