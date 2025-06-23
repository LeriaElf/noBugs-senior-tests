import { expect } from 'chai';
import { AdminSteps } from '../utils/adminSteps.js';
import LoginUserRequest from '../models/loginUserRequest.js';
import Requester from '../utils/requester.js';
import { ENDPOINTS_KEY } from '../utils/endpoints.js';
import HTTP_STATUS from '../utils/httpStatus.js';

describe('Auth Service Tests', function() {
    it('user should be able to login after creation', async () => {
            const { requestData } = await AdminSteps.createUser();
    
            const username = requestData.username;
            const password = requestData.password;
    
            const requester = new Requester();
            const { data, status, headers } = await requester.request(ENDPOINTS_KEY.LOGIN, {
                data: new LoginUserRequest({username, password})
            });
    
            expect(status).to.equal(HTTP_STATUS.OK);
            expect(data.username).to.equal(username);
            expect(headers.authorization).to.exist;
    });

    it('admin should be able to login with correct credentials', async () => {
        const requester = new Requester();
            
        const { status, headers } = await requester.request(ENDPOINTS_KEY.LOGIN, {
                data: new LoginUserRequest({username: 'admin', password: 'admin'})
            });
        
            expect(status).to.equal(HTTP_STATUS.OK);
            expect(headers.authorization).to.equal(`Basic ${process.env.ADMIN_TOKEN}`);
    });
});