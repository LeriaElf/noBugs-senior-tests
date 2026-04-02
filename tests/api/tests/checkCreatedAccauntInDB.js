import { expect } from 'chai';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { userSteps } from '../../utils/fixtures.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { UserSession } from '../../utils/userSessionAnnotation.js';
import { skipUnlessVersion } from '../../utils/apiVersion.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import { DatabaseSteps } from '../../utils/database/databaseSteps.js';
import { requester } from '../../utils/requester.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { HTTP_STATUS } from '../../utils/httpStatus.js';

describe('Account Servise tests', function () {
  before(function () {
    if (skipUnlessVersion('with_database')) this.skip();
  });

  it(
    'Created account should be saved in database',
    UserSession({ amount: 1 })(async users => {
      const [user] = users;

      const auth = RequestSpecs.authAsUserData(user);
      const config = await auth.buildConfig();
      const token = config.headers.Authorization;

      const { accounts: prevAccounts } = await userSteps.getCustomerAccaunts(token);
      expect(prevAccounts.length).to.equal(0);

      const { data: accountData } = await new ValidatedRequester(
        auth,
        ENDPOINT_KEY.ACCOUNTS_CREATE,
        ResponseSpecs.entityWasCreated(),
      ).post({ stepName: 'Create new account for user' });

      expect(accountData.accountNumber).to.exist;

      const accountDao = await DatabaseSteps.getAccountByNumber(accountData.accountNumber, {
        stepName: `Verify account "${accountData.accountNumber}" in database`,
      });

      await assertThatModels(accountData, accountDao).match({
        stepName: 'Compare API response with DB record',
      });
    }),
  );

  it('Invalid username should not create user in DB', async function () {
    const invalidUser = { username: 'ab', password: 'ValidPass123$$', role: 'USER' };

    try {
      await requester.request('ADMIN_CREATE_USER', {
        data: invalidUser,
        config: ApiConfig.adminAuth,
        stepName: `Try to create user with invalid username "${invalidUser.username}"`,
      });
      throw new Error('Expected create user request to fail with 400, but it succeeded');
    } catch (error) {
      expect(error.response?.status).to.equal(HTTP_STATUS.BAD_REQUEST);
    }

    const userDao = await DatabaseSteps.findUserByUsername(invalidUser.username, {
      stepName: `Verify user "${invalidUser.username}" was not created in database`,
    });
    expect(userDao).to.be.null;
  });
});
