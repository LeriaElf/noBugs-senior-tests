import axios from 'axios';
import dotenv from 'dotenv';

const dotenvPath = process.env.DOTENV_CONFIG_PATH || '.env';
dotenv.config(dotenvPath ? { path: dotenvPath } : undefined);
const baseURL = process.env.BASE_URL;

export class HttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 10_000,
    });
  }

  async get(url, config = {}) {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      if (error.response) {
        throw new Error(`Request failed with status code ${error.response.status}`, {
          cause: error,
        });
      }
      throw error;
    }
  }

  async post(url, data, config) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      throw {
        message: `Request failed with status code ${error.response.status}`,
        response: error.response,
      };
    }
  }

  async put(url, data, config) {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      throw {
        message: `Request failed with status code ${error.response.status}`,
        response: error.response,
      };
    }
  }

  async delete(url, config) {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      if (!error.response) {
        throw error;
      }
      throw {
        message: `Request failed with status code ${error.response.status}`,
        response: error.response,
      };
    }
  }
}
