import { BaseModel } from './baseModel.js';
import { GetCustomerProfileResponse } from './getCustomerProfileResponse.js';

export class PutCustomerProfileResponse extends BaseModel {
  constructor({ customer, message }) {
    super({ message });
    this.customer = new GetCustomerProfileResponse(customer);
  }
}
