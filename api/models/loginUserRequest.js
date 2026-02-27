import { BaseModel } from "./baseModel.js";

export class LoginUserRequest extends BaseModel {
  constructor({ username, password }) {
    super({ username, password });
  }
}
