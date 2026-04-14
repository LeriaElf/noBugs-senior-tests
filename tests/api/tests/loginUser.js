import 'dotenv/config';
import { expect } from 'chai';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { LoginUserRequest } from '../../models/loginUserRequest.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';

describe('Auth Servise tests', function () {
  let userId;
  const unAuth = RequestSpecs.withConfig({});

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to login after creation by admin', async () => {
    const { requestData, responseData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;
    userId = responseData.id;

    const { data, headers } = await new ValidatedRequester(
      unAuth,
      ENDPOINT_KEY.LOGIN,
      ResponseSpecs.okWithField('username'),
    ).post({
      data: new LoginUserRequest({ username, password }),
      stepName: `Login as user "${username}"`,
    });

    expect(data.username).to.equal(username);
    expect(headers.authorization).to.exist;
  });

  it('Admin shoud be able to login with correct credentials', async () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    const { headers } = await new ValidatedRequester(
      unAuth,
      ENDPOINT_KEY.LOGIN,
      ResponseSpecs.ok(),
    ).post({
      data: new LoginUserRequest({ username, password }),
      stepName: `Login as admin "${username}"`,
    });

    expect(headers.authorization).to.equal(process.env.ADMIN_TOKEN);
  });
});
