import { test, expect } from '../fixtures/baseUi.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { TransferPage } from '../pages/transferPage/transferPage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';

test.describe('Transfer Service Tests', () => {
  test('@UserSession(amount=1); User should be able to find all his transactions', async ({
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

    await test.step("Transfer money between user's accounts and find them into the transactions list", async () => {
      await userDashboard.clickTransferButton();

      const transferPage = new TransferPage(page);
      await transferPage.titleIsVisible();

      await transferPage.accountForm.chooseAccount(firstAccount.accountNumber);
      await transferPage.accountForm.fillRecipientName(userName);
      await transferPage.accountForm.fillRecipientAccount(secondAccount.accountNumber);
      await transferPage.accountForm.enterAmount(firstAccount.balance / 2);
      await transferPage.confirmCheckboxClick();

      await transferPage.checkAlertAndAccept(BankAlert.TRANSFER_SUCCESS, () =>
        transferPage.clickTransferButton(),
      );

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
        ResponseSpecs.okArrayBy('accounts'),
      ).get();

      const senderAccountFromApi = data.accounts.find(
        acc => acc.accountNumber === firstAccount.accountNumber,
      );
      const recieverAccountFromApi = data.accounts.find(
        acc => acc.accountNumber === secondAccount.accountNumber,
      );

      expect(senderAccountFromApi).toBeTruthy();
      expect(recieverAccountFromApi).toBeTruthy();

      await transferPage.clickHomeButton();
      await userDashboard.clickTransferButton();
      (await transferPage.titleIsVisible()).clickTransferAgainButton();
      await transferPage.transactionList.titleIsVisible();

      await transferPage.transactionList.expectApiTransactionsToBeVisible([
        ...senderAccountFromApi.transactions,
        ...recieverAccountFromApi.transactions,
      ]);
    });
  });
});
