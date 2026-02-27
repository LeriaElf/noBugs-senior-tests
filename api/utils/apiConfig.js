import "dotenv/config";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export class ApiConfig {
  static #defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  static get unAuth() {
    return {
      headers: this.#defaultHeaders,
    };
  }

  static get adminAuth() {
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
}
