import { requester } from '../requester.js';
import { ApiConfig } from '../apiConfig.js';
import { ENDPOINT_KEY } from '../enpoints.js';
import { AccountTransferRequest } from '../../models/accountTransferRequest.js';
import { stepLogger } from '../stepLogger.js';
import { UserSteps } from '../steps/userSteps.js';

export class FraudTransferSteps extends UserSteps {
  constructor({ token } = {}) {
    super({ token });
  }

  async executeFraudTransfer(sender, receiver, transferData) {
    const amount = typeof transferData === 'object' ? transferData.amount : transferData;

    const response = await this.transferWithFraudCheck(
      sender.account.id ?? sender.id,
      receiver.account.id ?? receiver.id,
      amount,
    );

    return response.data;
  }

  async transferWithFraudCheck(senderAccountId, receiverAccountId, amount, token) {
    token = token ?? (await this.ensureToken());

    return await stepLogger.step(
      `Transfer amount "${amount}" with fraud check from account "${senderAccountId}" to account "${receiverAccountId}"`,
      async () => {
        const response = await requester.request(ENDPOINT_KEY.TRANSFER_WITH_FRAUD_CHECK, {
          data: new AccountTransferRequest({
            senderAccountId,
            receiverAccountId,
            amount,
          }),
          config: ApiConfig.getUserAuth(token),
        });

        return {
          status: response.status,
          data: response.data,
        };
      },
    );
  }

  async getAccountState(accountRef) {
    return await stepLogger.step('Get customer account', async () => {
      const response = await requester.request(ENDPOINT_KEY.CUSTOMER_ACCOUNTS, {
        config: ApiConfig.getUserAuth(accountRef.user.token),
      });
      const accounts = Array.isArray(response.data) ? response.data : response.data.accounts;

      return accounts.find(acc => acc.id === accountRef.account.id);
    });
  }
}
