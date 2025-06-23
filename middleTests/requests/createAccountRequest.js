import HttpClient from "../utils/httpClient.js";
import ApiConfig from "../utils/apiConfig.js";
import CreateAccountResponse from "../models/createAccountResponse.js";

export default class CreateAccountRequest {
    constructor() {
        this.httpClient = new HttpClient();
    }

    async createAccount(authHeaders) {
        const response = await this.httpClient.post(
            '/accounts', 
            {}, 
            { headers: { 'Authorization': authHeaders } }
        );

        return {
            status: response.status,
            responseData: CreateAccountResponse.fromJson(response.data)
        }
    }
}