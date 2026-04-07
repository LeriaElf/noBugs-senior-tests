import { test, expect } from '../fixtures/baseUi.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { TransferPage } from '../pages/transferPage/transferPage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { parseAlertAmount, parseAlertAccount } from '../utils/patterns.js';
import { generateNonExistentAccount } from '../utils/generateNonExistentAccount.js';
import { setupSenderWithAccount } from '../../helpers/setupSenderWithAccount.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { getAccountByNumberFromBackend } from '../utils/backendState.js';

test.describe('Transfer Service Tests', () => {
  test("@UserSession(amount=1); User should be able to transfer valid amount between user's accounts", async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { firstAccount, secondAccount, userName, userAuth } =
      await test.step('Precondition: create two funded accounts for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const firstAccount = await userSession.steps.createAccount();
        const firstDeposit = await userSession.steps.depositeToAccount(firstAccount.accountId);
        const secondAccount = await userSession.steps.createAccount();
        const secondDeposit = await userSession.steps.depositeToAccount(secondAccount.accountId);

        return {
          firstAccount: { ...firstAccount, balance: firstDeposit.balance },
          secondAccount: { ...secondAccount, balance: secondDeposit.balance },
          userName: userSession.user.username,
          userAuth: ApiConfig.getUserAuth(userSession.token),
        };
      });

    await test.step("Transfer money between user's accounts", async () => {
      const userDashboard = new UserDashboard(page);
      await userDashboard.clickTransferButton();

      const transferPage = new TransferPage(page);
      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(
        firstAccount.accountNumber,
        firstAccount.accountId,
      );
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(secondAccount.accountNumber);
      await transferPage.accountForm.enterAmount(firstAccount.balance);
      await transferPage.confirmCheckboxClick();

      const alertMessage = await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SUCCESS, () =>
        transferPage.clickTransferButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(firstAccount.balance);
      expect(parseAlertAccount(alertMessage)).toBe(secondAccount.accountNumber);

      const senderAccount = await getAccountByNumberFromBackend(
        firstAccount.accountNumber,
        userAuth,
      );
      expect(senderAccount.balance).toBe(0);

      const receiverAccount = await getAccountByNumberFromBackend(
        secondAccount.accountNumber,
        userAuth,
      );
      expect(receiverAccount.balance).toBe(firstAccount.balance + secondAccount.balance);

      await page.reload();
      const visibleBalance = await transferPage.accountForm.getSelectedAccountBalance(
        secondAccount.accountNumber,
        secondAccount.accountId,
      );
      expect(Number(visibleBalance)).toBe(firstAccount.balance + secondAccount.balance);
    });
  });

  test("User should be able to transfer to someone else's account", async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { senderAccount, recipientAccount, recipientName, senderToken, recipientToken } =
      await test.step('Precondition: create users, authorize, create accounts', async () => {
        const {
          token,
          accounts: [senderAccount],
        } = await setupSenderWithAccount({ withUserSession });

        const {
          token: recipientToken,
          accounts: [recipientAccount],
          userName: recipientName,
        } = await setupSenderWithAccount({ withUserSession });

        await authWithToken({ token, goto: URLS.DASHBOARD });
        await userDashboard.expectLoaded();

        return {
          senderAccount,
          recipientAccount,
          recipientName,
          senderToken: token,
          recipientToken,
        };
      });

    await test.step('Transfer money between different users accounts', async () => {
      await userDashboard.clickTransferButton();

      const transferPage = new TransferPage(page);
      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(
        senderAccount.accountNumber,
        senderAccount.accountId,
      );
      await transferPage.accountForm.fillRecipientName(recipientName);
      await transferPage.accountForm.fillRecipientAccount(recipientAccount.accountNumber);
      await transferPage.accountForm.enterAmount(senderAccount.balance);
      await transferPage.confirmCheckboxClick();

      const alertMessage = await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SUCCESS, () =>
        transferPage.clickTransferButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(senderAccount.balance);
      expect(parseAlertAccount(alertMessage)).toBe(recipientAccount.accountNumber);

      const senderAccountApi = await getAccountByNumberFromBackend(
        senderAccount.accountNumber,
        ApiConfig.getUserAuth(senderToken),
      );
      expect(senderAccountApi.balance).toBe(0);

      const recipientAccountApi = await getAccountByNumberFromBackend(
        recipientAccount.accountNumber,
        ApiConfig.getUserAuth(recipientToken),
      );
      expect(recipientAccountApi.balance).toBe(senderAccount.balance + recipientAccount.balance);
    });
  });

  test('@UserSession(amount=1); User should not be able to transfer to a non-existent account', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account, userName, userAuth } =
      await test.step('Precondition: create funded account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();
        const deposit = await userSession.steps.depositeToAccount(account.accountId);

        return {
          account: { ...account, balance: deposit.balance },
          userName: userSession.user.username,
          userAuth: ApiConfig.getUserAuth(userSession.token),
        };
      });

    await test.step('Transfer money to a non-existent account', async () => {
      await userDashboard.clickTransferButton();
      const transferPage = new TransferPage(page);

      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(
        generateNonExistentAccount(account.accountNumber),
      );
      await transferPage.accountForm.enterAmount(account.balance);
      await transferPage.confirmCheckboxClick();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_WRONG_ACCOUNT, () =>
        transferPage.clickTransferButton(),
      );

      const senderAccount = await getAccountByNumberFromBackend(account.accountNumber, userAuth);
      expect(senderAccount.balance).toBe(account.balance);
    });
  });

  test('@UserSession(amount=1); User should not be able to transfer with blank/unchecked fields', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    await test.step('Precondition: open dashboard for authorized user', async () => {
      await page.goto(URLS.DASHBOARD);
      await userDashboard.expectLoaded();
      await userSession.steps.createAccount();
    });

    await test.step('Transfer money with blank fields', async () => {
      await userDashboard.clickTransferButton();
      const transferPage = new TransferPage(page);

      await transferPage.titleIsVisible();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_FILL_ALL_FIELDS, () =>
        transferPage.clickTransferButton(),
      );
    });
  });

  test('@UserSession(amount=1); User should not be able to transfer with zero amount', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account, userName, userAuth } =
      await test.step('Precondition: create funded account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();
        const deposit = await userSession.steps.depositeToAccount(account.accountId);

        return {
          account: { ...account, balance: deposit.balance },
          userName: userSession.user.username,
          userAuth: ApiConfig.getUserAuth(userSession.token),
        };
      });

    await test.step('Transfer money with zero amount', async () => {
      await userDashboard.clickTransferButton();
      const transferPage = new TransferPage(page);

      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(account.accountNumber);
      await transferPage.accountForm.enterAmount('0');
      await transferPage.confirmCheckboxClick();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SAME_ACCOUNT, () =>
        transferPage.clickTransferButton(),
      );

      const senderAccount = await getAccountByNumberFromBackend(account.accountNumber, userAuth);
      expect(senderAccount.balance).toBe(account.balance);
    });
  });

  test('@UserSession(amount=1); User should not be able to transfer without confirm checkbox', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account, userName, userAuth } =
      await test.step('Precondition: create funded account for authorized user', async () => {
        await page.goto(URLS.DASHBOARD);
        await userDashboard.expectLoaded();

        const account = await userSession.steps.createAccount();
        const deposit = await userSession.steps.depositeToAccount(account.accountId);

        return {
          account: { ...account, balance: deposit.balance },
          userName: userSession.user.username,
          userAuth: ApiConfig.getUserAuth(userSession.token),
        };
      });

    await test.step('Transfer money without confirm checkbox', async () => {
      await userDashboard.clickTransferButton();
      const transferPage = new TransferPage(page);
      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(account.accountNumber, account.accountId);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(account.accountNumber);
      await transferPage.accountForm.enterAmount(account.balance);
      expect(await transferPage.checkboxIsChecked()).toBe(false);

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_FILL_ALL_FIELDS, () =>
        transferPage.clickTransferButton(),
      );

      const senderAccount = await getAccountByNumberFromBackend(account.accountNumber, userAuth);
      expect(senderAccount.balance).toBe(account.balance);
    });
  });
});
