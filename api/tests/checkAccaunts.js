import { expect } from 'chai';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { ENPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { ApiConfig } from '../utils/apiConfig.js';
import { userSteps } from '../utils/fixtures.js';
import { AdminSteps } from '../utils/steps/adminSteps.js';

describe('Account Servise tests', function () {
  let token;
  let userId;

  before(async () => {
    const response = await userSteps.createUserWithAccounts();
    token = response.token;
    userId = response.userId;
  });

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to see all their accounts', async () => {
    const { status, data } = await requester.request(ENPOINT_KEY.CUSTOMER_ACCOUNTS, {
      config: ApiConfig.getUserAuth(token),
      stepName: 'Get all customer accounts',
    });

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(data.accounts).to.have.lengthOf(2);

    for (const account of data.accounts) {
      expect(account.balance).to.be.greaterThan(0);
    }
  });
});
