import { generateUser } from '../generator/generateRandomUserData.js';
import CrudRequester from './requester.js';
import ApiConfig from './apiConfig.js';

export class AdminSteps {
  static async createUser() {
    const userData = generateUser();

    const crudRequester = new CrudRequester();

    const response = await crudRequester.request('ADMIN_USER', {
      data: userData,
      config: ApiConfig.adminAuth
    });

    return {
      requestData: userData,
      responseData: response.data,
      status: response.status
    };
  }
}
