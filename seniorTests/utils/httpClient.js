import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL;

export default class HttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: backendUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

async get(url, config = {}) {
    try {
        return await this.client.get(url, config);
    } catch (error) {
        if (error.response) {
            throw new Error(`Request failed with status ${error.response.status}`);
        }
    throw error;
    }
}

  async post(url, data, config = {}) {
    try {
        return await this.client.post(url, data, config);
    } catch (error) {
        throw {
          message: `Request failed with status ${error.response.status}`,
          response: error.response
        };
    }
  }
}
