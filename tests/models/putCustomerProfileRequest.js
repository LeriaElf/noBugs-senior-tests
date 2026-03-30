import { BaseModel } from './baseModel.js';
import { generateDataForEntity } from '../generator/generateDataForEntity.js';

export class PutCustomerProfileRequest extends BaseModel {
  constructor({ name }) {
    super({ name });
  }

  static get validationRules() {
    return {
      name: { type: 'string', regex: /^[A-Za-z]{3,15}\s[A-Za-z]{3,15}$/ },
    };
  }

  static generateProfileName() {
    const generatedData = generateDataForEntity(PutCustomerProfileRequest.validationRules);
    return new PutCustomerProfileRequest(generatedData);
  }
}
