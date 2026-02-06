import { requester } from "../requester.js";
import { ApiConfig } from "../apiConfig.js";
import { ENPOINT_KEY } from "../enpoints.js";
import { LoginUserRequest } from "../../models/loginUserRequest.js";
import { AccountDepositRequest } from "../../models/accountDepositRequest.js";
import { AdminSteps } from "../steps/adminSteps.js";

export class UserSteps {
  static async loginUser(username, password) {
    const response = await requester.request(ENPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });

    return response.headers.authorization;
  }

  static async createAccount(token) {
    const response = await requester.request(ENPOINT_KEY.ACCOUNTS_CREATE, {
      data: null,
      config: ApiConfig.getUserAuth(token),
    });

    return {
      status: response.status,
      accountId: response.data.id,
      accountNumber: response.data.accountNumber,
      balance: response.data.balance,
      transactions: response.data.transactions,
    };
  }

  static async depositeToAccount(token, accountId, amount = null) {
    const balance = AccountDepositRequest.generateBalanceData();

    const response = await requester.request(ENPOINT_KEY.ACCOUNTS_DEPOSIT, {
      data: new AccountDepositRequest({
        id: accountId,
        balance: amount ?? balance,
      }),
      config: ApiConfig.getUserAuth(token),
    });

    return {
      status: response.status,
      balance: response.data.balance,
      transactions: response.data.transactions,
    };
  }

  static async createUserWithAccounts(amountOfAccounts = 2) {
    const { requestData, responseData } = await AdminSteps.createUser();
    const token = await this.loginUser(
      requestData.username,
      requestData.password,
    );

    const accountIds = [];

    for (let i = 0; i < amountOfAccounts; i++) {
      const account = await this.createAccount(token);
      accountIds.push(account.accountId);

      await this.depositeToAccount(token, account.accountId);
    }

    return { token, accountIds, userId: responseData.id };
  }

  static async getCustomerAccaunts(token) {
    return await requester.request(ENPOINT_KEY.CUSTOMER_ACCOUNTS, {
      config: ApiConfig.getUserAuth(token),
    });
  }

  static async getAccountWithBalance(token) {
    const { data } = await this.getCustomerAccaunts(token);
    const sender = data.accounts.find((acc) => acc.balance > 0);

    return { accounts: data.accounts, sender };
  }

  static async getUserProfileData(token) {
    const { status, data } = await requester.request(
      ENPOINT_KEY.CUSTOMER_PROFILE_GET,
      {
        config: ApiConfig.getUserAuth(token),
      },
    );

    return { status, data };
  }

  static async getTransactions(token, accountId) {
    const { status, data } = await requester.request(
      ENPOINT_KEY.ACCOUNTS_TRANSACTIONS,
      {
        config: ApiConfig.getUserAuth(token),
        urlParam: accountId,
      },
    );

    return { status, data };
  }
}
