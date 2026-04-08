import { expect } from 'chai';
import { UserSteps } from '../../utils/steps/userSteps.js';
import { FraudMockServer } from '../../utils/mocks/fraudMockServer.js';
import { prepareUsers, prepareAccounts, cleanupUsers } from '../../fixtures/prepareData.js';
import { skipUnlessVersion } from '../../utils/apiVersion.js';

const FRAUD_APPROVED_MOCK = {
  status: 'SUCCESS',
  decision: 'APPROVED',
  riskScore: 0.2,
  reason: 'Low risk transaction',
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

describe('Transfer with Fraud Check Tests', function () {
  this.timeout(60_000);

  let fraudMock;
  let users = [];
  let accounts = [];

  before(function () {
    if (skipUnlessVersion('with_fraud_check')) this.skip();
  });

  beforeEach(async function () {
    fraudMock = new FraudMockServer({ port: 8089, response: FRAUD_APPROVED_MOCK });
    await fraudMock.start();

    users = await prepareUsers(2);
    accounts = await prepareAccounts(users, { number: 2, deposit: 5000 });
  });

  afterEach(async function () {
    if (fraudMock) await fraudMock.stop();
    await cleanupUsers(users);
  });

  it('approved transfer should return correct fraud decision', async function () {
    const sender = accounts[0];
    const receiver = accounts[1];
    const transferAmount = Math.round((Math.random() * 4999 + 1) * 100) / 100;

    const senderSteps = new UserSteps(sender.user);

    const transferResult = await senderSteps.transferWithFraudCheck(
      sender.account.id,
      receiver.account.id,
      transferAmount,
    );
    const transferResponse = transferResult.data;

    expect(transferResponse).to.exist;
    expect(transferResponse.status).to.equal(TRANSFER_APPROVED_EXPECTED.status);
    expect(transferResponse.message).to.equal(TRANSFER_APPROVED_EXPECTED.message);
    expect(transferResponse.amount).to.equal(transferAmount);
    expect(transferResponse.senderAccountId).to.equal(sender.account.id);
    expect(transferResponse.receiverAccountId).to.equal(receiver.account.id);
    expect(transferResponse.fraudRiskScore).to.equal(TRANSFER_APPROVED_EXPECTED.fraudRiskScore);
    expect(transferResponse.fraudReason).to.equal(TRANSFER_APPROVED_EXPECTED.fraudReason);
    expect(transferResponse.requiresManualReview).to.equal(
      TRANSFER_APPROVED_EXPECTED.requiresManualReview,
    );
    expect(transferResponse.requiresVerification).to.equal(
      TRANSFER_APPROVED_EXPECTED.requiresVerification,
    );
  });
});
