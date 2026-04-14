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
import { ApiConfig } from '../../utils/apiConfig.js';
import { HTTP_STATUS } from '../../utils/httpStatus.js';
import { errorHandlingRequester } from '../../utils/errorHandlingRequester.js';
import { ExpectedError } from '../../models/expectedError.js';
import { ADMIN_ERRORS, KEY_ERRORS } from '../../utils/responseTitles.js';
import { CreateUserRequest } from '../../models/createUserRequset.js';

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
    const invalidUserName = 'ab';

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [ADMIN_ERRORS.NAME_LENGTH],
    });

    await errorHandlingRequester.requestExpectingError(ENDPOINT_KEY.ADMIN_CREATE_USER, {
      data: CreateUserRequest.generateUserData({ username: invalidUserName }),
      config: ApiConfig.adminAuth,
      expectedError,
    });

    const userDao = await DatabaseSteps.findUserByUsername(invalidUserName, {
      stepName: `Verify user "${invalidUserName}" was not created in database`,
    });
    expect(userDao).to.be.null;
  });
});
