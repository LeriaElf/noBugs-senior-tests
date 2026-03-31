import { test, expect } from '../fixtures/baseUi.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { TransferPage } from '../pages/transferPage/transferPage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { parseAlertAmount, parseAlertAccount } from '../utils/patterns.js';
import { generateNonExistentAccount } from '../utils/generateNonExistentAccount.js';
import { setupSenderWithAccount } from '../../helpers/setupSenderWithAccount.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';

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

      await transferPage.accountForm.chooseAccount(firstAccount.accountNumber);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(secondAccount.accountNumber);
      await transferPage.accountForm.enterAmount(firstAccount.balance);
      await transferPage.confirmCheckboxClick();

      const alertMessage = await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SUCCESS, () =>
        transferPage.clickTransferButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(firstAccount.balance);
      expect(parseAlertAccount(alertMessage)).toBe(secondAccount.accountNumber);

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get();

      const { accounts } = data;
      const senderAccount = accounts.find(acc => acc.accountNumber === firstAccount.accountNumber);
      expect(senderAccount.balance).toBe(0);

      const receiverAccount = accounts.find(
        acc => acc.accountNumber === secondAccount.accountNumber,
      );
      expect(receiverAccount.balance).toBe(firstAccount.balance + secondAccount.balance);

      await page.reload();
      const visibleBalance = await transferPage.accountForm.getSelectedAccountBalance(
        secondAccount.accountNumber,
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

    const { senderSteps, senderAccount, recipientSteps, recipientAccount, recipientName } =
      await test.step('Precondition: create users, authorize, create accounts', async () => {
        const {
          steps: senderSteps,
          token,
          accounts: [senderAccount],
        } = await setupSenderWithAccount({ withUserSession });

        const {
          steps: recipientSteps,
          accounts: [recipientAccount],
          userName: recipientName,
        } = await setupSenderWithAccount({ withUserSession });

        await authWithToken({ token, goto: URLS.DASHBOARD });
        await userDashboard.expectLoaded();

        return {
          senderSteps,
          senderAccount,
          recipientSteps,
          recipientAccount,
          recipientName,
        };
      });

    await test.step('Transfer money between different users accounts', async () => {
      await userDashboard.clickTransferButton();

      const transferPage = new TransferPage(page);
      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(senderAccount.accountNumber);
      await transferPage.accountForm.fillRecipientName(recipientName);
      await transferPage.accountForm.fillRecipientAccount(recipientAccount.accountNumber);
      await transferPage.accountForm.enterAmount(senderAccount.balance);
      await transferPage.confirmCheckboxClick();

      const alertMessage = await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SUCCESS, () =>
        transferPage.clickTransferButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(senderAccount.balance);
      expect(parseAlertAccount(alertMessage)).toBe(recipientAccount.accountNumber);

      const { accounts } = await senderSteps.getCustomerAccaunts();
      const senderAccountApi = accounts.find(
        acc => acc.accountNumber === senderAccount.accountNumber,
      );
      expect(senderAccountApi.balance).toBe(0);

      const { accounts: recipientAccounts } = await recipientSteps.getCustomerAccaunts();
      const recipientAccountApi = recipientAccounts.find(
        acc => acc.accountNumber === recipientAccount.accountNumber,
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

      await transferPage.accountForm.chooseAccount(account.accountNumber);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(
        generateNonExistentAccount(account.accountNumber),
      );
      await transferPage.accountForm.enterAmount(account.balance);
      await transferPage.confirmCheckboxClick();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_WRONG_ACCOUNT, () =>
        transferPage.clickTransferButton(),
      );

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get();

      const { accounts } = data;
      const senderAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);
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

      await transferPage.accountForm.chooseAccount(account.accountNumber);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(account.accountNumber);
      await transferPage.accountForm.enterAmount('0');
      await transferPage.confirmCheckboxClick();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SAME_ACCOUNT, () =>
        transferPage.clickTransferButton(),
      );

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get();

      const { accounts } = data;
      const senderAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);
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

      await transferPage.accountForm.chooseAccount(account.accountNumber);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(account.accountNumber);
      await transferPage.accountForm.enterAmount(account.balance);
      expect(await transferPage.checkboxIsChecked()).toBe(false);

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_FILL_ALL_FIELDS, () =>
        transferPage.clickTransferButton(),
      );

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get();

      const { accounts } = data;
      const senderAccount = accounts.find(acc => acc.accountNumber === account.accountNumber);
      expect(senderAccount.balance).toBe(account.balance);
    });
  });
});
