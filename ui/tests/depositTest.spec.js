import { test, expect } from "../fixtures/baseUi";
import { UserDashboard } from "../pages/userDashboard";
import { DepositPage } from "../pages/depositPage.js";
import { BankAlert } from "../utils/bankAlert.js";
import { URLS } from "../utils/urls.js";
import { parseAlertAmount, parseAlertAccount } from "../utils/patterns.js";
import { setupSenderWithAccount } from "../helpers/setupSenderWithAccount.js";

test.describe("Deposit Servise Tests", () => {
  test("User shoud be able to deposit valid amount into the users's account", async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { steps, account } =
      await test.step("Precondition: create user, authorize, create account", async () => {
        const {
          steps,
          token,
          accounts: [account],
        } = await setupSenderWithAccount({ withUserSession });
        await authWithToken({
          token,
          goto: URLS.DASHBOARD,
        });
        await userDashboard.expectLoaded();

        return { steps, account };
      });

    await test.step("Deposit money to user's account", async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber);
      const amount = await depositMoneyPage.accountForm.enterAmount();

      const alertMessage = await depositMoneyPage.checkAlertAndAccept(
        BankAlert.DEPOSIT_SUCCESS,
        () => depositMoneyPage.clickDepositButton(),
      );

      expect(parseAlertAmount(alertMessage)).toBe(amount);
      expect(parseAlertAccount(alertMessage)).toBe(account.accountNumber);

      const { accounts } = await steps.getCustomerAccaunts();
      const userAccount = accounts.find(
        (acc) => acc.accountNumber === account.accountNumber,
      );
      expect(userAccount.balance).toBe(account.balance + amount);
    });
  });

  test("User should not be able to deposit without choosing account or amount", async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { account } =
      await test.step("Precondition: create user, authorize, create account", async () => {
        const {
          token,
          accounts: [account],
        } = await setupSenderWithAccount({ withUserSession });
        await authWithToken({
          token,
          goto: URLS.DASHBOARD,
        });
        await userDashboard.expectLoaded();

        return { account };
      });

    await test.step("Deposit money without choosing account, amount", async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.enterAmount();

      await depositMoneyPage.checkAlertAndAccept(
        BankAlert.DEPOSIT_SELECT_ACC,
        () => depositMoneyPage.clickDepositButton(),
      );

      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber);
      await depositMoneyPage.accountForm.clearAmount();

      await depositMoneyPage.checkAlertAndAccept(
        BankAlert.DEPOSIT_VALID_AMOUNT,
        () => depositMoneyPage.clickDepositButton(),
      );
    });
  });

  test("User should not be able to deposit invalid amount", async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);

    const { steps, account } =
      await test.step("Precondition: create user, authorize, create account", async () => {
        const {
          steps,
          token,
          accounts: [account],
        } = await setupSenderWithAccount({ withUserSession });
        await authWithToken({
          token,
          goto: URLS.DASHBOARD,
        });
        await userDashboard.expectLoaded();

        return { steps, account };
      });

    await test.step("Deposit invalid amount", async () => {
      await userDashboard.clickDepositMoneyButton();

      const depositMoneyPage = new DepositPage(page);
      await depositMoneyPage.accountForm.chooseAccount(account.accountNumber);
      await depositMoneyPage.accountForm.enterAmount("-100");

      await depositMoneyPage.checkAlertAndAccept(
        BankAlert.DEPOSIT_VALID_AMOUNT,
        () => depositMoneyPage.clickDepositButton(),
      );

      await depositMoneyPage.titleIsVisible();

      const { accounts } = await steps.getCustomerAccaunts();
      const userAccount = accounts.find(
        (acc) => acc.accountNumber === account.accountNumber,
      );
      expect(userAccount.balance).toBe(account.balance);
    });
  });
});
