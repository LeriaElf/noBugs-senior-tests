import { expect } from "chai";
import AuthService from "../utils/authService.js";
import AdminCreateUserRequest from "../requests/adminCreateUserRequest.js";
import CreateAccountRequest from "../requests/createAccountRequest.js";


describe('Auth Service Tests', function() {
    this.timeout(5000);
    it('should return admin auth token', async () => {
        const authService = new AuthService();
        const response = await authService.login('admin', 'admin');

        expect(response.headers.Authorization).to.equal('Basic YWRtaW46YWRtaW4=');
        expect(response.status).to.equal(200);
    });
});

describe('Admin Service Tests', function() {
    this.timeout(10000);
    it('admin should be able to create a user', async () => {
        const adminCreateUserRequest = new AdminCreateUserRequest();
        const {sentData, response, status} = await adminCreateUserRequest.createUser('USER');

        expect(status).to.equal(201);
        expect(response.username).to.equal(sentData.username);
        expect(response.role).to.equal(sentData.role)
    })
});

describe('Account Service Tests', function() {
    this.timeout(5000);
    it('user should be able to create an account', async () => {        
        const adminCreateUserRequest = new AdminCreateUserRequest();
        const user = await adminCreateUserRequest.createUser('USER');
        console.log('[DEBUG] User password:', user.response.password);
    
        const authService = new AuthService();
        const authResponse = await authService.login(
            user.response.username,
            user.response.password 
        );
    
        const authToken = authResponse.headers.Authorization;
    
        const accountService = new CreateAccountRequest();
        const { responseData, status } = await accountService.createAccount(authToken);
    
        expect(status).to.equal(201);
        expect(responseData.accountNumber).to.be.a('string').and.not.empty;
    });
    
});