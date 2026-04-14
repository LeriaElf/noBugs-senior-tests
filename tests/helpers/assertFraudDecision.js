import { expect } from 'chai';

export function assertFraudDecision(actual, expected) {
  expect(actual.status).to.equal(expected.status);
  expect(actual.message).to.equal(expected.message);
  expect(actual.fraudRiskScore).to.equal(expected.fraudRiskScore);
  expect(actual.fraudReason).to.equal(expected.fraudReason);
  expect(actual.requiresManualReview).to.equal(expected.requiresManualReview);
  expect(actual.requiresVerification).to.equal(expected.requiresVerification);
}
