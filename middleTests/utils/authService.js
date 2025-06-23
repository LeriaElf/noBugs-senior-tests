import ApiConfig from "./apiConfig.js";
import HttpClient from "./httpClient.js";

export default class AuthService {
    constructor() {
        this.httpClient = new HttpClient();
    }

    async login(username, password) {
        const response = await this.httpClient.post(
            '/auth/login', 
            { username, password }, 
            ApiConfig.unauth.headers
        );
        
        return {
            headers: { Authorization: response.headers.authorization },
            status: response.status,
            data: response.data
        };
    }

    async loginAsAdmin () {
        return ApiConfig.adminAuth;
    }
}