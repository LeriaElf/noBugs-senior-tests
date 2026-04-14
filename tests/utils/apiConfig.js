import 'dotenv/config';
import { requester } from './requester.js';
import { LoginUserRequest } from '../models/loginUserRequest.js';
import { ENDPOINT_KEY } from './enpoints.js';
import { HTTP_STATUS } from './httpStatus.js';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export class ApiConfig {
  static #defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  static get unAuth() {
    return {
      headers: this.#defaultHeaders,
    };
  }

  static get adminAuth() {
    const rawToken = process.env.ADMIN_TOKEN;
    if (!rawToken || rawToken === 'undefined') {
      throw new Error(
        'ADMIN_TOKEN env var is required (Basic token value without "Basic " prefix)',
      );
    }

    return {
      headers: {
        ...this.#defaultHeaders,
        Authorization: ADMIN_TOKEN,
      },
    };
  }

  static getUserAuth(token) {
    return {
      headers: {
        ...this.#defaultHeaders,
        Authorization: `${token}`,
      },
    };
  }

  static async authAsUser(userData = {}) {
    const { username, password } = userData;
    if (!username || !password) {
      throw new Error('ApiConfig.authAsUser: username and password are required');
    }

    const { status, headers } = await requester.request(ENDPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });
    if (status !== HTTP_STATUS.OK) {
      throw new Error(`Login failed with status ${status}`);
    }

    const token = headers?.authorization;
    if (!token) {
      throw new Error('ApiConfig.authAsUser: Authorization header is missing');
    }

    return this.getUserAuth(token);
  }
}
