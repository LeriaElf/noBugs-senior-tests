import { DatabaseSteps } from '../../utils/database/databaseSteps.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { isApiVersion } from '../../utils/apiVersion.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';

export async function getUserByUsernameFromBackend(username) {
  if (isApiVersion('with_database')) {
    return await DatabaseSteps.findUserByUsername(username, {
      stepName: `Find user "${username}" in database`,
    });
  }

  const { users } = await AdminSteps.getAllUsers();
  return users.find(user => user.username === username) ?? null;
}

export async function getAccountByNumberFromBackend(accountNumber, userAuth) {
  if (isApiVersion('with_database')) {
    return await DatabaseSteps.findAccountByNumber(accountNumber, {
      stepName: `Find account "${accountNumber}" in database`,
    });
  }

  const { data } = await new ValidatedRequester(
    RequestSpecs.withConfig(userAuth),
    ENDPOINT_KEY.CUSTOMER_ACCOUNTS,
    ResponseSpecs.okArrayBy('accounts'),
  ).get();

  return data.accounts.find(account => account.accountNumber === accountNumber) ?? null;
}
