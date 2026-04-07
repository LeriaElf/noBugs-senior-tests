import { BaseModel } from './baseModel.js';
import { CreateUserRequest } from './createUserRequset.js';

export class GetAllUsersResponse extends BaseModel {
  constructor(data) {
    const usersArray = Array.isArray(data) ? data : data?.users ?? [];
    super({ users: usersArray.map(user => new CreateUserRequest(user)) });
  }
}
