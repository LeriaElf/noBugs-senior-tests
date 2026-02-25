import { BaseModel } from "./baseModel.js";
import { AccountDepositResponse } from "./accountDepositResponse.js";

export class GetCustomerProfileResponse extends BaseModel {
  constructor({ id, username, password, name = null, role, accounts = [] }) {
    super({ id, username, password, name, role });
    this.accounts = accounts.map((acc) => new AccountDepositResponse(acc));
  }
}
