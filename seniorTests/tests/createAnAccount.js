import { expect } from 'chai';
import { AdminSteps } from '../utils/adminSteps.js';
import LoginUserRequest from '../models/loginUserRequest.js';
import Requester from '../utils/requester.js';
import ApiConfig from '../utils/apiConfig.js';
import { ENDPOINTS_KEY } from '../utils/endpoints.js';
import HTTP_STATUS from '../utils/httpStatus.js';

describe('Account Service Tests', function() {
    it('user should be able to create an account', async () => {
            const { requestData } = await AdminSteps.createUser();
    
            const username = requestData.username;
            const password = requestData.password;
    
            const requester = new Requester();
            const { status: loginStatus, headers } = await requester.request(ENDPOINTS_KEY.LOGIN, {
                data: new LoginUserRequest({username, password})
            });
    
            const token = headers.authorization;
    
            expect(loginStatus).to.equal(HTTP_STATUS.OK);
    
            const { data: accountData, status: accountCreateStatus } = await requester.request(ENDPOINTS_KEY.ACCOUNTS, {
                data: null,
                config: ApiConfig.getUserAuth(token),
            });
    
            expect(accountCreateStatus).to.equal(HTTP_STATUS.CREATED);
            expect(accountData.accountNumber).to.exist;
        });
});