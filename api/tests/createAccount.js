import { AdminSteps } from '../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { expect } from 'chai';
import { ENPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { ApiConfig } from '../utils/apiConfig.js';
import { userSteps } from '../utils/fixtures.js';

describe('Account Servise tests', function () {
  let userId;

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to create account', async () => {
    const { requestData, responseData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;
    userId = responseData.id;

    const { status: loginStatus, token } = await userSteps.loginUser(username, password);
    expect(loginStatus).to.equal(HTTP_STATUS.OK);

    const { accounts } = await userSteps.getCustomerAccaunts(token);
    expect(accounts.length).to.equal(0);

    const { status: accountCreateStatus, data: accountCreateData } = await requester.request(
      ENPOINT_KEY.ACCOUNTS_CREATE,
      {
        data: null,
        config: ApiConfig.getUserAuth(token),
        stepName: 'Create new account for user',
      },
    );

    expect(accountCreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(accountCreateData.accountNumber).to.exist;

    const { accounts: newUserAccounts } = await userSteps.getCustomerAccaunts(token);
    expect(newUserAccounts.length).to.equal(1);
  });
});
