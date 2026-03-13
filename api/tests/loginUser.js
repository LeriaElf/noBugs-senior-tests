import 'dotenv/config';
import { expect } from 'chai';
import { AdminSteps } from '../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { ENPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { LoginUserRequest } from '../models/loginUserRequest.js';

describe('Auth Servise tests', function () {
  let userId;

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to login after creation by admin', async () => {
    const { requestData, responseData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;
    userId = responseData.id;

    const { data, status, headers } = await requester.request(ENPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(data.username).to.equal(username);
    expect(headers.authorization).to.exist;
  });

  it('Admin shoud be able to login with correct credentials', async () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    const { status, headers } = await requester.request(ENPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(headers.authorization).to.equal(process.env.ADMIN_TOKEN);
  });
});
