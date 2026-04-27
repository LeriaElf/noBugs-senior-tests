import { test, expect } from '../fixtures/baseUi.js';
import { BankAlert } from '../utils/bankAlert.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { getAccountByNumberFromBackend } from '../utils/backendState.js';

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
    const created = await getAccountByNumberFromBackend(accountNumber, userAuth);
    expect(created).toBeTruthy();
    expect(created.balance).toBe(0);
  });
});
