import { CreateUserRequest } from "../../models/createUserRequset.js";
import { requester } from "../requester.js";
import { ApiConfig } from "../apiConfig.js";
import { ENPOINT_KEY } from "../enpoints.js";

export class AdminSteps {
  static async createUser() {
    const userData = CreateUserRequest.generateUserData();

    const response = await requester.request(ENPOINT_KEY.ADMIN_CREATE_USER, {
      data: userData,
      config: ApiConfig.adminAuth,
    });

    return {
      requestData: userData,
      responseData: response.data,
      status: response.status,
    };
  }

  static async getAllUsers() {
    const { data, status } = await requester.request(
      ENPOINT_KEY.ADMIN_GET_ALL_USERS,
      {
        config: ApiConfig.adminAuth,
      },
    );

    return { data, status };
  }

  static async deleteUser(userId) {
    const resp = await requester.request(ENPOINT_KEY.ADMIN_DELETE_USER, {
      config: ApiConfig.adminAuth,
      urlParam: userId,
    });

    return resp;
  }
}
