import { BaseModel } from "./baseModel.js";

export class CreateUserResponse extends BaseModel {
  constructor({ id, username, password, name = "", role, accounts = [] }) {
    super({ id, username, password, name, role, accounts });
  }
}
