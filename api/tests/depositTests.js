import { expect } from 'chai';
import { AdminSteps } from '../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { ENPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { ApiConfig } from '../utils/apiConfig.js';
import { userSteps } from '../utils/fixtures.js';
import { errorHandlingRequester } from '../utils/errorHandlingRequester.js';
import { AccountDepositRequest } from '../models/accountDepositRequest.js';
import { ExpectedError } from '../models/expectedError.js';
import { DEPOSIT_RESPONSE_MESSAGES, DEPOSIT_ERRORS, KEY_ERRORS } from '../utils/responseSpec.js';

describe('Deposit Servise tests', function () {
  let token;
  let accountId;
  let userId;

  before(async () => {
    const { requestData, responseData } = await AdminSteps.createUser();

    const response = await userSteps.loginUser(requestData.username, requestData.password);
    token = response.token;
    userId = responseData.id;

    const account = await userSteps.createAccount(token);
    accountId = account.accountId;
  });

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  const validAmount = [0.01, 4999.99, 5000];
  let accumulatedBalance = 0;

  validAmount.forEach(amount => {
    it(`User shoud be able to deposit valid amount - ${amount} into the users's account`, async () => {
      const { status: depositStatus, data: depositData } = await requester.request(
        ENPOINT_KEY.ACCOUNTS_DEPOSIT,
        {
          data: new AccountDepositRequest({ id: accountId, balance: amount }),
          config: ApiConfig.getUserAuth(token),
        },
      );

      accumulatedBalance += amount;

      expect(depositStatus).to.equal(HTTP_STATUS.OK);
      expect(depositData.balance).to.equal(accumulatedBalance);

      const currentTransaction = depositData.transactions.find(t => t.amount === amount);
      expect(currentTransaction.relatedAccountId).to.equal(accountId);

      const { data } = await userSteps.getTransactions(accountId, token);
      const foundTransaction = data.transactions.find(tr => tr.id === currentTransaction.id);
      expect(foundTransaction).to.exist;
      expect(foundTransaction.amount).to.equal(amount);
    });
  });

  it('User shoud not be able to deposit money to the others account', async () => {
    const balance = AccountDepositRequest.generateBalanceData();

    const { accounts } = await userSteps.getCustomerAccaunts(token);
    const initialBalance = accounts[0].balance;

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      errorKey: KEY_ERRORS.ERROR,
      errorMessages: [DEPOSIT_RESPONSE_MESSAGES.UNAUTHORASED_ACCESS],
    });

    await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
      data: new AccountDepositRequest({ id: accountId + 100, balance }),
      config: ApiConfig.getUserAuth(token),
      expectedError,
    });

    const { accounts: newAccounts } = await userSteps.getCustomerAccaunts(token);
    expect(newAccounts[0].balance).to.equal(initialBalance);
  });

  const invalidAmount = [
    { amount: 0, errorMessages: [DEPOSIT_ERRORS.DEPOSIT_MIN] },
    { amount: 5000.01, errorMessages: [DEPOSIT_ERRORS.DEPOSIT_MAX] },
    { amount: -1, errorMessages: [DEPOSIT_ERRORS.DEPOSIT_MIN] },
  ];

  invalidAmount.forEach(({ amount, errorMessages }) => {
    it(`User shoud not be able to deposit incorrect amount - ${amount} to the account`, async () => {
      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey: KEY_ERRORS.AMOUNT,
        errorMessages,
      });

      const { accounts } = await userSteps.getCustomerAccaunts(token);
      const initialBalance = accounts[0].balance;

      await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
        data: new AccountDepositRequest({ id: accountId, balance: amount }),
        config: ApiConfig.getUserAuth(token),
        expectedError,
      });

      const { accounts: newAccounts } = await userSteps.getCustomerAccaunts(token);
      expect(newAccounts[0].balance).to.equal(initialBalance);
    });
  });

  it('User should not be able to deposit without amount', async () => {
    const { accounts } = await userSteps.getCustomerAccaunts(token);
    const initialBalance = accounts[0].balance;

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, // API bug: returns 500 instead of 400
      errorKey: KEY_ERRORS.ERROR,
      errorMessages: [DEPOSIT_RESPONSE_MESSAGES.SERVER_ERROR],
    });

    await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
      data: new AccountDepositRequest({ id: accountId, balance: '' }),
      config: ApiConfig.getUserAuth(token),
      expectedError,
    });

    const { accounts: newAccounts } = await userSteps.getCustomerAccaunts(token);
    expect(newAccounts[0].balance).to.equal(initialBalance);
  });
});
