import { AdminSteps } from '../utils/steps/adminSteps.js';
import { ApiConfig } from '../utils/apiConfig.js';
import { ENDPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { isApiVersion } from '../utils/apiVersion.js';
import { AccountDepositRequest } from '../models/accountDepositRequest.js';
import { UserSteps } from '../utils/steps/userSteps.js';

export async function prepareUsers(amount = 1) {
  const users = [];

  for (let i = 0; i < amount; i++) {
    const { requestData, responseData } = await AdminSteps.createUser();
    const userSteps = new UserSteps(requestData);
    const { token } = await userSteps.loginUser(requestData.username, requestData.password);

    users.push({
      ...requestData,
      id: responseData.id,
      token,
    });
  }

  return users;
}

export async function prepareAccounts(users = [], { number = users.length, deposit = null } = {}) {
  const preparedAccounts = [];
  const limit = Math.min(number, users.length);

  for (let i = 0; i < limit; i++) {
    const user = users[i];
    const userSteps = new UserSteps(user);
    const createdAccount = await userSteps.createAccount(user.token);
    let account = null;

    if (deposit != null) {
      if (isApiVersion('with_fraud_check')) {
        const response = await requester.request(ENDPOINT_KEY.ACCOUNTS_DEPOSIT_FRAUD, {
          data: new AccountDepositRequest({
            accountId: createdAccount.accountId,
            amount: deposit,
          }),
          config: ApiConfig.getUserAuth(user.token),
          stepName: `Deposit ${deposit} to account ${createdAccount.accountId} for fraud-check setup`,
        });
        account = response.data;
      } else {
        const depositResponse = await userSteps.depositeToAccount(
          createdAccount.accountId,
          deposit,
          user.token,
        );
        account = {
          id: createdAccount.accountId,
          accountNumber: createdAccount.accountNumber,
          balance: depositResponse.balance,
          transactions: depositResponse.transactions,
        };
      }
    }

    if (!account) {
      const { accounts } = await userSteps.getCustomerAccaunts(user.token);
      account = accounts.find(acc => acc.id === createdAccount.accountId);
    }

    preparedAccounts.push({
      user,
      account: account ?? { id: createdAccount.accountId, balance: createdAccount.balance },
    });
  }

  return preparedAccounts;
}

export async function cleanupUsers(users = []) {
  for (const user of users) {
    if (user?.id) {
      await AdminSteps.deleteUser(user.id);
    }
  }
}
