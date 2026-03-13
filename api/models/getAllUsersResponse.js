import { BaseModel } from './baseModel.js';
import { CreateUserRequest } from './createUserRequset.js';

export class GetAllUsersResponse extends BaseModel {
  constructor(usersArray) {
    super({ users: usersArray.map(user => new CreateUserRequest(user)) });
  }
}
