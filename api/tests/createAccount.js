import { expect } from 'chai';
import { ENDPOINT_KEY } from '../utils/enpoints.js';
import { userSteps } from '../utils/fixtures.js';
import { RequestSpecs } from '../utils/requestSpecs.js';
import { ResponseSpecs } from '../utils/responseSpecs.js';
import { ValidatedRequester } from '../utils/validatedRequester.js';
import { UserSession } from '../utils/userSessionAnnotation.js';

describe('Account Servise tests', function () {
  it(
    'User shoud be able to create account',
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

      const { data } = await new ValidatedRequester(
        auth,
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get({ stepName: 'Get users accounts' });

      const createdFromList = data.accounts.find(
        a => a.accountNumber === accountData.accountNumber,
      );
      expect(createdFromList, 'Created account must be present in accounts list').to.exist;

      expect(accountData.balance).to.equal(0);
      expect(createdFromList.balance).to.equal(0);
    }),
  );
});
