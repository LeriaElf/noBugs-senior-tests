import { test, expect } from '../fixtures/baseUi';
import { BankAlert } from '../utils/bankAlert.js';
import { ApiConfig } from '../../api/utils/apiConfig.js';
import { UserDashboard } from '../pages/userDashboard';
import { ENDPOINT_KEY } from '../../api/utils/enpoints.js';
import { ValidatedRequester } from '../../api/utils/validatedRequester.js';
import { RequestSpecs } from '../../api/utils/requestSpecs.js';
import { ResponseSpecs } from '../../api/utils/responseSpecs.js';

const ACCOUNT_NUMBER_RE = /Account Number:\s*([\w-]+)/;

test.describe('Account Servise Tests', () => {
  test('@UserSession(amount=1); User should be able to create new account', async ({
    page,
    userSession,
  }) => {
    const accountNumber = await new UserDashboard(page)
      .expectLoaded()
      .then(dashboard =>
        dashboard.checkAlertAndExtractAndAccept(
          BankAlert.NEW_ACCOUNT_ADDED,
          ACCOUNT_NUMBER_RE,
          () => dashboard.createAccount(),
        ),
      );

    expect(accountNumber).toBeTruthy();

    const userAuth = ApiConfig.getUserAuth(userSession?.token);

    const { data } = await new ValidatedRequester(
      RequestSpecs.withConfig(userAuth),
      ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
      ResponseSpecs.okArrayBy('accounts'),
    ).get();

    const created = data.accounts.find(acc => acc.accountNumber === accountNumber);
    expect(created).toBeTruthy();
    expect(created.balance).toBe(0);
  });
});
