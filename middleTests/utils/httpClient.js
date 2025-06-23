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

  async get(url, headers = {}) {
    return this.client.get(url, { headers });
  }

  async post(url, data, headers = {}) {
    return this.client.post(url, data, { headers });
  }
}