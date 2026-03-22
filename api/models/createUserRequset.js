import { BaseModel } from './baseModel.js';
import { generateDataForEntity } from '../generator/generateDataForEntity.js';

export class CreateUserRequest extends BaseModel {
  constructor({ username, password, role }) {
    super({ username, password, role });
  }

  static get validationRules() {
    return {
      username: { type: 'string', regex: /^[A-Za-z0-9]{3,15}$/ },
      password: { type: 'string', regex: /^[A-Z]{3}[a-z]{4}[0-9]{3}[$%&]{2}$/ },
      role: { type: 'string', regex: /^USER$/ },
    };
  }

  static generateUserData(overrides = {}) {
    const generatedData = generateDataForEntity(CreateUserRequest.validationRules);
    return new CreateUserRequest({ ...generatedData, ...overrides });
  }
}
