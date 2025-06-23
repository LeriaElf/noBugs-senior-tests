export default class ApiConfig {
    static #defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    static get unauth() {
        return {
            headers: this.#defaultHeaders,
        };
    }

    static get adminAuth() {
        return {
            headers: {
                ...this.#defaultHeaders,
                'Authorization': 'Basic YWRtaW46YWRtaW4=',
            },
        }
    }

    static getUserAuth(token) {
        return {
          headers: {
            ...this.#defaultHeaders,
            'Authorization': `Basic ${token}`
          }
        };
      }
    };