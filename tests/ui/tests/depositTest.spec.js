import { test, expect } from '../fixtures/baseUi.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { DepositPage } from '../pages/depositPage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { parseAlertAmount, parseAlertAccount } from '../utils/patterns.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { getAccountByNumberFromBackend } from '../utils/backendState.js';

test.describe('Deposit Servise Tests', () => {
  test("@UserSession(amount=1); User shoud be able to deposit valid amount into the users's account", async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account, userAuth } =
      await test.step('Precondition: create account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();
        console.log(account);
        const deposit = await userSession.steps.depositeToAccount(account.accountId);
        const userAuth = ApiConfig.getUserAuth(userSession.token);

        return {
          account: { ...account, balance: deposit.balance },
          userAuth,
        };
      });

    await test.step("Deposit money to user's account", async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      const amount = await depositMoneyPage.accountForm.enterAmount();

      const alertMessage = await depositMoneyPage.checkAlertAndAccept(
        BankAlert.DEPOSIT_SUCCESS,
        () => depositMoneyPage.clickDepositButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(amount);
      expect(parseAlertAccount(alertMessage)).toBe(account.accountNumber);

      const userAccount = await getAccountByNumberFromBackend(account.accountNumber, userAuth);
      expect(userAccount.balance).toBe(account.balance + amount);
    });
  });

  test('@UserSession(amount=1); User should not be able to deposit without choosing account or amount', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account } =
      await test.step('Precondition: create account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();

        return { account };
      });

    await test.step('Deposit money without choosing account, amount', async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.enterAmount();

      await depositMoneyPage.checkAlertAndAccept(BankAlert.DEPOSIT_SELECT_ACC, () =>
        depositMoneyPage.clickDepositButton(),
      );

      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      await depositMoneyPage.accountForm.clearAmount();

      await depositMoneyPage.checkAlertAndAccept(BankAlert.DEPOSIT_VALID_AMOUNT, () =>
        depositMoneyPage.clickDepositButton(),
      );
    });
  });

  test('@UserSession(amount=1); User should not be able to deposit invalid amount', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account, userAuth } =
      await test.step('Precondition: create account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();
        const deposit = await userSession.steps.depositeToAccount(account.accountId);
        const userAuth = ApiConfig.getUserAuth(userSession.token);

        return {
          account: { ...account, balance: deposit.balance },
          userAuth,
        };
      });

    await test.step('Deposit invalid amount', async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      await depositMoneyPage.accountForm.enterAmount('-100');

      await depositMoneyPage.checkAlertAndAccept(BankAlert.DEPOSIT_VALID_AMOUNT, () =>
        depositMoneyPage.clickDepositButton(),
      );

      await depositMoneyPage.titleIsVisible();

      const userAccount = await getAccountByNumberFromBackend(account.accountNumber, userAuth);
      expect(userAccount.balance).toBe(account.balance);
    });
  });
});
