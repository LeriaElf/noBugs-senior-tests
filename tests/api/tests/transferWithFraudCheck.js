import { expect } from 'chai';
import { ApiConfig } from '../../utils/apiConfig.js';
import { FraudMockServer } from '../../utils/mocks/fraudMockServer.js';
import { FraudTransferSteps } from '../../utils/steps/fraudTransferSteps.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { HTTP_STATUS } from '../../utils/httpStatus.js';
import { errorHandlingRequester } from '../../utils/errorHandlingRequester.js';
import { prepareUsers, prepareAccounts, cleanupUsers } from '../../fixtures/prepareData.js';
import { AccountTransferRequest } from '../../models/accountTransferRequest.js';
import { ExpectedError } from '../../models/expectedError.js';
import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import { skipUnlessVersion } from '../../utils/apiVersion.js';
import { AccountDepositRequest } from '../../models/accountDepositRequest.js';
import { assertFraudDecision } from '../../helpers/assertFraudDecision.js';

const FRAUD_APPROVED_MOCK = {
  status: 'SUCCESS',
  decision: 'APPROVED',
  riskScore: 0.2,
  reason: 'Low risk transaction',
  requiresManualReview: false,
  additionalVerificationRequired: false,
};

const FRAUD_MANUAL_REVIEW_MOCK = {
  status: 'SUCCESS',
  decision: 'MANUAL_REVIEW',
  riskScore: 0.75,
  reason: 'Suspicious transfer pattern',
  requiresManualReview: true,
  additionalVerificationRequired: false,
};

const FRAUD_VERIFICATION_REQUIRED_MOCK = {
  status: 'SUCCESS',
  decision: 'VERIFICATION_REQUIRED',
  riskScore: 0.9,
  reason: 'Additional verification required',
  requiresManualReview: false,
  additionalVerificationRequired: true,
};

const FRAUD_DECLINED_MOCK = {
  status: 'SUCCESS',
  decision: 'DECLINED',
  riskScore: 0.99,
  reason: 'High fraud risk',
  requiresManualReview: false,
  additionalVerificationRequired: false,
};

const TRANSFER_APPROVED_EXPECTED = {
  status: 'APPROVED',
  message: 'Transfer approved and processed immediately',
  fraudRiskScore: FRAUD_APPROVED_MOCK.riskScore,
  fraudReason: FRAUD_APPROVED_MOCK.reason,
  requiresManualReview: false,
  requiresVerification: false,
};

const TRANSFER_MANUAL_REVIEW_EXPECTED = {
  status: 'MANUAL_REVIEW_REQUIRED',
  message: 'Transfer requires manual review',
  fraudRiskScore: FRAUD_MANUAL_REVIEW_MOCK.riskScore,
  fraudReason: FRAUD_MANUAL_REVIEW_MOCK.reason,
  requiresManualReview: true,
  requiresVerification: false,
};

const TRANSFER_VERIFICATION_REQUIRED_EXPECTED = {
  status: 'VERIFICATION_REQUIRED',
  message: 'Additional verification required',
  fraudRiskScore: FRAUD_VERIFICATION_REQUIRED_MOCK.riskScore,
  fraudReason: FRAUD_VERIFICATION_REQUIRED_MOCK.reason,
  requiresManualReview: false,
  requiresVerification: true,
};

const TRANSFER_DECLINED_EXPECTED = {
  status: 'MANUAL_REVIEW_REQUIRED',
  message: 'Transfer requires manual review',
  fraudRiskScore: FRAUD_DECLINED_MOCK.riskScore,
  fraudReason: FRAUD_DECLINED_MOCK.reason,
  requiresManualReview: false,
  requiresVerification: false,
};

const FRAUD_DECISION_SCENARIOS = [
  {
    title: 'approved transfer should return correct fraud decision',
    mockResponse: FRAUD_APPROVED_MOCK,
    expectedResponse: TRANSFER_APPROVED_EXPECTED,
    shouldKeepBalances: false,
  },
  {
    title: 'manual review transfer should return correct fraud decision',
    mockResponse: FRAUD_MANUAL_REVIEW_MOCK,
    expectedResponse: TRANSFER_MANUAL_REVIEW_EXPECTED,
    shouldKeepBalances: true,
  },
  {
    title: 'verification required transfer should return correct fraud decision',
    mockResponse: FRAUD_VERIFICATION_REQUIRED_MOCK,
    expectedResponse: TRANSFER_VERIFICATION_REQUIRED_EXPECTED,
    shouldKeepBalances: true,
  },
  {
    title: 'declined transfer should return correct fraud decision',
    mockResponse: FRAUD_DECLINED_MOCK,
    expectedResponse: TRANSFER_DECLINED_EXPECTED,
    shouldKeepBalances: true,
  },
];

describe('Transfer with Fraud Check Tests', function () {
  this.timeout(60_000);

  let fraudMock;
  let users = [];
  let accounts = [];

  async function restartFraudMock(response) {
    if (fraudMock) await fraudMock.stop();
    fraudMock = new FraudMockServer({ port: 8089, response });
    await fraudMock.start();
  }

  function createFraudSteps(user) {
    return new FraudTransferSteps({ token: user.token });
  }

  async function captureBalances(sender, receiver, steps) {
    const senderAccount = await steps.getAccountState(sender);
    const receiverAccount = await steps.getAccountState(receiver);

    return { senderAccount, receiverAccount };
  }

  before(function () {
    if (skipUnlessVersion('with_fraud_check')) this.skip();
  });

  beforeEach(async function () {
    users = await prepareUsers(2);
    accounts = await prepareAccounts(users, { number: 2, deposit: 5000 });
  });

  afterEach(async function () {
    if (fraudMock) await fraudMock.stop();
    await cleanupUsers(users);
  });

  FRAUD_DECISION_SCENARIOS.forEach(
    ({ title, mockResponse, expectedResponse, shouldKeepBalances }) => {
      it(title, async function () {
        await restartFraudMock(mockResponse);

        const sender = accounts[0];
        const receiver = accounts[1];
        const transferAmount = AccountDepositRequest.generateBalanceData();

        const fraudTransferSteps = createFraudSteps(sender.user);

        const before = shouldKeepBalances
          ? await captureBalances(sender, receiver, fraudTransferSteps)
          : null;

        const requestData = new AccountTransferRequest({
          senderAccountId: sender.account.id,
          receiverAccountId: receiver.account.id,
          amount: transferAmount,
        });

        const transferResult = await fraudTransferSteps.transferWithFraudCheck(
          requestData.senderAccountId,
          requestData.receiverAccountId,
          requestData.amount,
        );

        await assertThatModels(requestData, transferResult.data).match();
        assertFraudDecision(transferResult.data, expectedResponse);

        if (shouldKeepBalances) {
          const after = await captureBalances(sender, receiver, fraudTransferSteps);

          expect(after.senderAccount.balance).to.equal(before.senderAccount.balance);
          expect(after.receiverAccount.balance).to.equal(before.receiverAccount.balance);
        }
      });
    },
  );

  it('User should not be able to transfer with insufficient funds with fraud check', async function () {
    const sender = accounts[0];
    const fraudTransferSteps = createFraudSteps(sender.user);

    const senderBefore = await fraudTransferSteps.getAccountState(sender);

    const requestData = new AccountTransferRequest({
      senderAccountId: sender.account.id,
      receiverAccountId: sender.account.id,
      amount: senderBefore.balance + 1,
    });

    const expectedError = new ExpectedError({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorKey: 'message',
      errorMessages: ['Insufficient funds'],
    });

    await errorHandlingRequester.requestExpectingError(ENDPOINT_KEY.TRANSFER_WITH_FRAUD_CHECK, {
      data: requestData,
      config: ApiConfig.getUserAuth(sender.user.token),
      expectedError,
    });

    const senderAfter = await fraudTransferSteps.getAccountState(sender);
    expect(senderAfter.balance).to.equal(senderBefore.balance);
  });
});
