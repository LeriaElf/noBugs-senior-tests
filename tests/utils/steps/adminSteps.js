import { CreateUserRequest } from '../../models/createUserRequset.js';
import { requester } from '../requester.js';
import { ApiConfig } from '../apiConfig.js';
import { ENDPOINT_KEY } from '../enpoints.js';
import { stepLogger } from '../stepLogger.js';

export class AdminSteps {
  static async createUser() {
    const userData = CreateUserRequest.generateUserData();

    return await stepLogger.step(
      `Create user with username "${userData.username}" and password "${userData.password}"`,
      async () => {
        const response = await requester.request(ENDPOINT_KEY.ADMIN_CREATE_USER, {
          data: userData,
          config: ApiConfig.adminAuth,
        });

        return {
          requestData: userData,
          responseData: response.data,
          status: response.status,
        };
      },
    );
  }

  static async getAllUsers() {
    return await stepLogger.step('Get all users', async () => {
      const { data, status } = await requester.request(ENDPOINT_KEY.ADMIN_GET_ALL_USERS, {
        config: ApiConfig.adminAuth,
      });

      return { users: data.users, status };
    });
  }

  static async deleteUser(userId) {
    return await stepLogger.step(`Delete user with id "${userId}"`, async () => {
      return await requester.request(ENDPOINT_KEY.ADMIN_DELETE_USER, {
        config: ApiConfig.adminAuth,
        urlParam: userId,
      });
    });
  }
}
