import { expect } from 'chai';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { userSteps } from '../../utils/fixtures.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { skipUnlessVersion } from '../../utils/apiVersion.js';

describe('Account Servise tests', function () {
  let token;
  let userId;
  let auth;

  before(async function () {
    if (skipUnlessVersion('with_validation_fix')) await this.skip();

    const response = await userSteps.createUserWithAccounts();
    token = response.token;
    userId = response.userId;
    auth = RequestSpecs.withConfig(ApiConfig.getUserAuth(token));
  });

  after(async () => {
    if (!userId) return;
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to see all their accounts', async () => {
    const { data } = await new ValidatedRequester(
      auth,
      ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
      ResponseSpecs.okArrayBy('accounts'),
    ).get({ stepName: 'Get all customer accounts' });

    expect(data.accounts).to.have.lengthOf(2);

    for (const account of data.accounts) {
      expect(account.balance).to.be.greaterThan(0);
    }
  });
});
