import { requester } from "../requester.js";
import { ApiConfig } from "../apiConfig.js";
import { ENPOINT_KEY } from "../enpoints.js";
import { LoginUserRequest } from "../../models/loginUserRequest.js";
import { AccountDepositRequest } from "../../models/accountDepositRequest.js";
import { AdminSteps } from "./adminSteps.js";
import { HTTP_STATUS } from "../httpStatus.js";
import { log } from "node:console";

export class UserSteps {
  constructor({ username, password, token } = {}) {
    this.username = username;
    this.password = password;
    this.token = token;
  }

  async ensureToken() {
    if (this.token) return this.token;
    if (!this.username || !this.password) {
      throw new Error(
        "UserSteps.ensure token: need username/password or a token",
      );
    }

    const { status, token } = await this.loginUser(
      this.username,
      this.password,
    );
    if (status !== HTTP_STATUS.OK) {
      throw new Error(`Login failed with status code ${status}`);
    }

    this.token = token;

    if (!this.token) throw new Error("Auth token is missed");

    return this.token;
  }

  async loginUser(username, password) {
    const response = await requester.request(ENPOINT_KEY.LOGIN, {
      data: new LoginUserRequest({ username, password }),
    });

    return {
      status: response.status,
      token: response.headers.authorization,
    };
  }

  async createAccount(token) {
    token = token ?? (await this.ensureToken());

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

  async depositeToAccount(accountId, amount = null, token) {
    token = token ?? (await this.ensureToken());

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

  async createUserWithAccounts(amountOfAccounts = 2) {
    const { requestData, responseData } = await AdminSteps.createUser();
    const { token } = await this.loginUser(
      requestData.username,
      requestData.password,
    );

    const accountIds = [];

    for (let i = 0; i < amountOfAccounts; i++) {
      const account = await this.createAccount(token);
      accountIds.push(account.accountId);

      await this.depositeToAccount(account.accountId, null, token);
    }

    return { token, accountIds, userId: responseData.id };
  }

  async getCustomerAccaunts(token) {
    token = token ?? (await this.ensureToken());

    const response = await requester.request(ENPOINT_KEY.CUSTOMER_ACCOUNTS, {
      config: ApiConfig.getUserAuth(token),
    });

    return { status: response.status, accounts: response.data.accounts };
  }

  async getAccountWithBalance(token) {
    token = token ?? (await this.ensureToken());

    const { accounts } = await this.getCustomerAccaunts(token);
    const sender = accounts.find((acc) => acc.balance > 0);

    return { accounts, sender };
  }

  async getUserProfileData(token) {
    token = token ?? (await this.ensureToken());

    const { status, data } = await requester.request(
      ENPOINT_KEY.CUSTOMER_PROFILE_GET,
      {
        config: ApiConfig.getUserAuth(token),
      },
    );

    return { status, data };
  }

  async getTransactions(accountId, token) {
    token = token ?? (await this.ensureToken());

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
