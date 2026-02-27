import { BaseModel } from "./baseModel.js";

export class LoginUserResponse extends BaseModel {
  constructor({ username, role }) {
    super({ username, role });
  }
}
