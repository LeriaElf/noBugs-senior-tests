import { expect } from "chai";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { ENPOINT_KEY } from "../utils/enpoints.js";
import { requester } from "../utils/requester.js";
import { ApiConfig } from "../utils/apiConfig.js";
import { UserSteps } from "../utils/steps/userSteps.js";
import { errorHandlingRequester } from "../utils/errorHandlingRequester.js";
import { AccountTransferRequest } from "../models/accountTransferRequest.js";
import { AccountTransferResponse } from "../models/accountTransferResponse.js";
import { assertThatModels } from "../models/comparison/modelAssertions.js";
import { ExpectedError } from "../models/expectedError.js";
import { TRANSFER_ERRORS } from "../utils/responseSpec.js";

describe("Transfer Service tests", function () {
  let token;
  let accountIds;

  before(async () => {
    const response = await UserSteps.createUserWithAccounts(3);
    token = response.token;
    accountIds = response.accountIds;
  });

  beforeEach(async () => {
    await UserSteps.depositeToAccount(token, accountIds[0], 5000);
  });

  const validData = [
    { amount: 0.01, extraDeposit: 0 },
    { amount: 9999.99, extraDeposit: 10000 },
    { amount: 10000, extraDeposit: 10000 },
  ];

  validData.forEach(({ amount, extraDeposit }) => {
    it(`User should be able to transfer valid amount - ${amount} between their accounts`, async () => {
      const { accounts, sender } = await UserSteps.getAccountWithBalance(token);
      const receiverAccount = accounts.find((acc) => acc.id !== sender.id);

      if (extraDeposit > 0) {
        await UserSteps.depositeToAccount(token, sender.id, 5000);
        await UserSteps.depositeToAccount(token, sender.id, 5000);
      }

      const { accounts: updatedAccounts } =
        await UserSteps.getAccountWithBalance(token);
      const updatedSender = updatedAccounts.find((acc) => acc.id === sender.id);
      const updatedReceiver = updatedAccounts.find(
        (acc) => acc.id === receiverAccount.id,
      );

      const initialSenderBalance = updatedSender.balance;
      const initialReceiverBalance = updatedReceiver.balance;

      const requestData = new AccountTransferRequest({
        senderAccountId: sender.id,
        receiverAccountId: receiverAccount.id,
        amount,
      });

      const { status, data } = await requester.request(
        ENPOINT_KEY.ACCOUNTS_TRANSFER,
        {
          data: requestData,
          config: ApiConfig.getUserAuth(token),
        },
      );
      const responseData = new AccountTransferResponse(data);

      expect(status).to.equal(HTTP_STATUS.OK);
      await assertThatModels(requestData, responseData).match();

      const { data: newAccauntsData } =
        await UserSteps.getCustomerAccaunts(token);

      const newSenderAccount = newAccauntsData.accounts.find(
        (acc) => acc.id === sender.id,
      );
      const newReceiverAccount = newAccauntsData.accounts.find(
        (acc) => acc.id === receiverAccount.id,
      );

      expect(newSenderAccount.balance).to.equal(initialSenderBalance - amount);
      expect(newReceiverAccount.balance).to.equal(
        initialReceiverBalance + amount,
      );

      const senderDecimalPart = String(newSenderAccount.balance).split(".")[1];
      const receiverDecimalPart = String(newReceiverAccount.balance).split(
        ".",
      )[1];

      expect(
        !senderDecimalPart || senderDecimalPart.length <= 2,
        `Sender balance has more than 2 decimal places: ${newSenderAccount.balance}`,
      ).to.be.true;
      expect(
        !receiverDecimalPart || receiverDecimalPart.length <= 2,
        `Receiver balance has more than 2 decimal places: ${newReceiverAccount.balance}`,
      ).to.be.true;
    });
  });

  it("User should be able to transfer to someone else's account", async () => {
    const { accountIds: newUserAccountIds } =
      await UserSteps.createUserWithAccounts(1);

    const { sender } = await UserSteps.getAccountWithBalance(token);
    const receiverId = newUserAccountIds[0];
    const initialSenderBalance = sender.balance;

    const requestData = new AccountTransferRequest({
      senderAccountId: sender.id,
      receiverAccountId: receiverId,
      amount: initialSenderBalance,
    });

    const { status, data } = await requester.request(
      ENPOINT_KEY.ACCOUNTS_TRANSFER,
      {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
      },
    );
    const responseData = new AccountTransferResponse(data);

    expect(status).to.equal(HTTP_STATUS.OK);
    await assertThatModels(requestData, responseData).match();

    const { data: newAccauntsData } =
      await UserSteps.getCustomerAccaunts(token);
    const newSenderAccount = newAccauntsData.accounts.find(
      (acc) => acc.id === sender.id,
    );

    expect(newSenderAccount.balance).to.equal(0);
  });

  it("User should not be able to transfer to a non-existent account", async () => {
    const { accountIds: newUserAccountIds } =
      await UserSteps.createUserWithAccounts(1);
    const nonExistentAccount = newUserAccountIds[0] + 1000;
    const sendAmount = AccountTransferRequest.generateTranferData();

    const { sender } = await UserSteps.getAccountWithBalance(token);

    const requestData = new AccountTransferRequest({
      senderAccountId: sender.id,
      receiverAccountId: nonExistentAccount,
      amount: sendAmount,
    });

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorKey: KEY_ERRORS.ERROR,
      errorMessages: [TRANSFER_ERRORS.INVALID_TRANSFER],
    });

    await errorHandlingRequester.requestExpectingError(
      ENPOINT_KEY.ACCOUNTS_TRANSFER,
      {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
        expectedError,
      },
    );
  });

  it("User should not be able to transfer to the same account", async () => {
    const { sender } = await UserSteps.getAccountWithBalance(token);
    const sendAmount = AccountTransferRequest.generateTranferData();

    const requestData = new AccountTransferRequest({
      senderAccountId: sender.id,
      receiverAccountId: sender.id,
      amount: sendAmount,
    });

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorKey: KEY_ERRORS.ERROR,
      errorMessages: [TRANSFER_ERRORS.INVALID_TRANSFER],
    });

    await errorHandlingRequester.requestExpectingError(
      ENPOINT_KEY.ACCOUNTS_TRANSFER,
      {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
        expectedError,
      },
    );
  });

  it("User should not be able to transfer more funds from their account than is available there", async () => {
    const { accounts, sender } = await UserSteps.getAccountWithBalance(token);
    const initialSenderBalance = sender.balance;

    const receiverAccount = accounts.find((acc) => acc.id !== sender.id);

    const requestData = new AccountTransferRequest({
      senderAccountId: sender.id,
      receiverAccountId: receiverAccount.id,
      amount: initialSenderBalance + 1,
    });

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorKey: KEY_ERRORS.AMOUNT,
      errorMessages: [TRANSFER_ERRORS.TRANSFER_MAX],
    });

    await errorHandlingRequester.requestExpectingError(
      ENPOINT_KEY.ACCOUNTS_TRANSFER,
      {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
        expectedError,
      },
    );

    const { data: newAccauntsData } =
      await UserSteps.getCustomerAccaunts(token);
    const newSenderAccount = newAccauntsData.accounts.find(
      (acc) => acc.id === sender.id,
    );
    expect(newSenderAccount.balance).to.equal(initialSenderBalance);
  });

  const invalidData = [
    { amount: 0, errorMessages: [TRANSFER_ERRORS.TRANSFER_MIN] },
    {
      amount: 10000.99,
      errorMessages: [TRANSFER_ERRORS.TRANSFER_MAX],
      // errorMessages: ["Invalid transfer: insufficient funds or invalid accounts"],// плавающий
    },
    { amount: -1, errorMessages: [TRANSFER_ERRORS.TRANSFER_MIN] },
  ];

  invalidData.forEach(({ amount, errorMessages }) => {
    it(`User should not be able to transfer invalid amount - ${amount}`, async () => {
      const { accounts, sender } = await UserSteps.getAccountWithBalance(token);
      const receiverAccount = accounts.find((acc) => acc.id !== sender.id);

      await UserSteps.depositeToAccount(token, sender.id, 5000);
      await UserSteps.depositeToAccount(token, sender.id, 5000);

      const requestData = new AccountTransferRequest({
        senderAccountId: sender.id,
        receiverAccountId: receiverAccount.id,
        amount,
      });

      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey: KEY_ERRORS.AMOUNT,
        errorMessages,
      });

      await errorHandlingRequester.requestExpectingError(
        ENPOINT_KEY.ACCOUNTS_TRANSFER,
        {
          data: requestData,
          config: ApiConfig.getUserAuth(token),
          expectedError,
        },
      );
    });
  });
});
