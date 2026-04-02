import { DBRequest } from './dbRequest.js';
import { Condition } from './condition.js';
import { UserDao } from '../../models/dao/userDao.js';
import { AccountDao } from '../../models/dao/accountDao.js';
import { stepLogger } from '../stepLogger.js';

export class DatabaseSteps {
  static async getUserByUsername(username, { stepName = null } = {}) {
    const action = async () =>
      await DBRequest.builder()
        .table('customers')
        .where(Condition.equalTo('username', username))
        .extractAs(UserDao);

    if (stepName) {
      return await stepLogger.step(stepName, action);
    }

    return await action();
  }

  static async findUserByUsername(username, { stepName = null } = {}) {
    const action = async () =>
      await DBRequest.builder()
        .table('customers')
        .where(Condition.equalTo('username', username))
        .extractOptionalAs(UserDao);

    if (stepName) {
      return await stepLogger.step(stepName, action);
    }

    return await action();
  }

  static async getAccountByNumber(accountNumber, { stepName = null } = {}) {
    const action = async () =>
      await DBRequest.builder()
        .table('accounts')
        .where(Condition.equalTo('account_number', accountNumber))
        .extractAs(AccountDao);

    if (stepName) {
      return await stepLogger.step(stepName, action);
    }

    return await action();
  }

  static async findAccountByNumber(accountNumber, { stepName = null } = {}) {
    const action = async () =>
      await DBRequest.builder()
        .table('accounts')
        .where(Condition.equalTo('account_number', accountNumber))
        .extractOptionalAs(AccountDao);

    if (stepName) {
      return await stepLogger.step(stepName, action);
    }

    return await action();
  }
}
