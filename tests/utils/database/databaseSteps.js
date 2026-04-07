import { DBRequest } from './dbRequest.js';
import { Condition } from './condition.js';
import { UserDao } from '../../models/dao/userDao.js';
import { AccountDao } from '../../models/dao/accountDao.js';
import { stepLogger } from '../stepLogger.js';
import { execute } from './dbClient.js';

export class DatabaseSteps {
  static async deleteUserCascade(userId, { stepName = null } = {}) {
    const action = async () => {
      const transactionDeletes = [
        'DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE customer_id = $1)',
        'DELETE FROM transactions WHERE related_account_id IN (SELECT id FROM accounts WHERE customer_id = $1)',
        'DELETE FROM transactions WHERE sender_account_id IN (SELECT id FROM accounts WHERE customer_id = $1)',
        'DELETE FROM transactions WHERE receiver_account_id IN (SELECT id FROM accounts WHERE customer_id = $1)',
      ];

      for (const sql of transactionDeletes) {
        try {
          await execute(sql, [userId]);
        } catch (error) {
          if (!['42P01', '42703'].includes(error.code)) {
            throw error;
          }
        }
      }

      await execute('DELETE FROM accounts WHERE customer_id = $1', [userId]);
      await execute('DELETE FROM customers WHERE id = $1', [userId]);
    };

    if (stepName) {
      return await stepLogger.step(stepName, action);
    }

    return await action();
  }

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
