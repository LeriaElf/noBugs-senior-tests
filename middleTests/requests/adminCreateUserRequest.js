import HttpClient from "../utils/httpClient.js";
import ApiConfig from "../utils/apiConfig.js";
import CreateUserRequest from "../models/createUserRequest.js";
import CreateUserResponse from "../models/createUserResponse.js";

export default class AdminCreateUserRequest {
    constructor() {
        this.httpClient = new HttpClient();
    }

    async createUser(role = 'USER') {
        const userData = CreateUserRequest.generateUserData(role);
        const originalPassword = userData.password; 
        const response = await this.httpClient.post('/admin/users', userData, ApiConfig.adminAuth.headers);
        
        return {
            status: response.status,
            sentData: userData,
            response: {
                ...CreateUserResponse.fromJson(response.data),
                password: originalPassword // Include the original password in the response
            }
        };
    }
}