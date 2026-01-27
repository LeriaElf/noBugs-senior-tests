import { expect } from "chai";
import { AdminSteps } from "../utils/steps/adminSteps.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { ENPOINT_KEY } from "../utils/enpoints.js";
import { requester } from "../utils/requester.js";
import { ApiConfig } from "../utils/apiConfig.js";
import { UserSteps } from "../utils/steps/userSteps.js";
import { ErrorHandlingRequester } from "../utils/errorHandlingRequester.js";
import { AccountDepositRequest } from "../models/accountDepositRequest.js";
import { ExpectedError } from "../models/expectedError.js";

describe("Deposit Servise tests", function () {
  let token;
  let accountId;

  before(async () => {
    const { requestData } = await AdminSteps.createUser();
    token = await UserSteps.loginUser(
      requestData.username,
      requestData.password,
    );

    const account = await UserSteps.createAccount(token);
    accountId = account.accountId;
  });

  const validAmount = [0.01, 4999.99, 5000];
  let accumulatedBalance = 0;

  validAmount.forEach((amount) => {
    it(`User shoud be able to deposit valid amount - ${amount} into the users's account`, async () => {
      const { status: depositStatus, data: depositData } =
        await requester.request(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
          data: new AccountDepositRequest({ id: accountId, balance: amount }),
          config: ApiConfig.getUserAuth(token),
        });

      accumulatedBalance += amount;

      expect(depositStatus).to.equal(HTTP_STATUS.OK);
      expect(depositData.balance).to.equal(accumulatedBalance);
      expect(depositData.accountNumber).to.exist;

      const currentTransaction = depositData.transactions.find(
        (t) => t.amount === amount,
      );
      expect(currentTransaction).to.exist;
      expect(currentTransaction.timestamp).to.exist;
      expect(currentTransaction.relatedAccountId).to.equal(accountId);
    });
  });

  it("User shoud not be able to deposit money to the others account", async () => {
    const balance = AccountDepositRequest.generateBalanceData();

    const errorRequest = new ErrorHandlingRequester();

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      errorKey: "error",
      errorMessages: ["Unauthorized access to account"],
    });

    await errorRequest.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
      data: new AccountDepositRequest({ id: accountId + 100, balance }),
      config: ApiConfig.getUserAuth(token),
      expectedError,
    });
  });

  const invalidAmount = [
    { amount: 0, errorMessages: ["Deposit amount must be at least 0.01"] },
    { amount: 5000.01, errorMessages: ["Deposit amount cannot exceed 5000"] },
    { amount: -1, errorMessages: ["Deposit amount must be at least 0.01"] },
  ];

  invalidAmount.forEach(({ amount, errorMessages }) => {
    it(`User shoud not be able to deposit incorrect amount - ${amount} to the account`, async () => {
      const errorRequest = new ErrorHandlingRequester();

      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey: "amount",
        errorMessages,
      });

      await errorRequest.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
        data: new AccountDepositRequest({ id: accountId, balance: amount }),
        config: ApiConfig.getUserAuth(token),
        expectedError,
      });
    });
  });

  it("User should not be able to deposit without amount", async () => {
    const errorRequest = new ErrorHandlingRequester();

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, // API bug: returns 500 instead of 400
      errorKey: "error",
      errorMessages: ["Internal Server Error"],
    });

    await errorRequest.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
      data: new AccountDepositRequest({ id: accountId, balance: "" }),
      config: ApiConfig.getUserAuth(token),
      expectedError,
    });
  });
});
