import { test, expect } from "../fixtures/baseUi";
import { BankAlert } from "../utils/bankAlert.js";
import { URLS } from "../utils/urls.js";
import { UserDashboard } from "../pages/userDashboard";
import { HTTP_STATUS } from "@/seniorTests/utils/httpStatus";

const ACCOUNT_NUMBER_RE = /Account Number:\s*([\w-]+)/;

test.describe("Account Servise Tests", () => {
  test("User should be able to create new account", async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const [session] = await withUserSession(1); // ne ponyatno
    const { steps, token } = session;

    await authWithToken({ token, goto: URLS.DASHBOARD });

    const userDashboard = new UserDashboard(page);
    await userDashboard.expectLoaded();

    const accountNumber = await userDashboard.checkAlertAndExtractAndAccept(
      BankAlert.NEW_ACCOUNT_ADDED,
      ACCOUNT_NUMBER_RE,
      () => userDashboard.createAccount(),
    );

    expect(accountNumber).toBeTruthy();

    const { status: accStatus, accounts } = await steps.getCustomerAccaunts();
    expect(accStatus).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(accounts)).toBe(true);

    const created = accounts.find((acc) => acc.accountNumber === accountNumber);
    expect(created).toBeTruthy();
    expect(created.balance).toBe(0);
  });
});
