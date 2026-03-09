import { test as sessions } from './withUserSession';
import { HTTP_STATUS } from '../../api/utils/httpStatus.js';
import { UserSteps } from '../../api/utils/steps/userSteps';

async function injectTokenAndGoto(page, { token, goto = '/' }) {
  if (!token) throw new Error('Authorization header is missing');

  await page.addInitScript(t => window.localStorage.setItem('authToken', t), token);

  await page.goto(goto);

  return token;
}

export const test = sessions.extend({
  authAsUser: [
    async ({ page }, use) => {
      async function authAsUser({ username, password, goto = '/' }) {
        if (!username || !password) throw new Error('AuthAsUser: username or password is missing');

        const { status, token } = await UserSteps.loginUser(username, password);

        if (status !== HTTP_STATUS.OK) throw new Error(`Login failed with status code: ${status}`);

        if (!token) throw new Error('Authorization header is missing');

        return injectTokenAndGoto(page, { token, goto });
      }

      await use(authAsUser);
    },
    { scope: 'test' },
  ],

  authWithToken: [
    async ({ page }, use) => {
      function authWithToken({ token, goto = '/' }) {
        return injectTokenAndGoto(page, { token, goto });
      }

      await use(authWithToken);
    },
    { scope: 'test' },
  ],
});

export const expect = test.expect;
