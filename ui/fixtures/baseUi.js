import { test as sessions } from './withUserSession';
import { HTTP_STATUS } from '../../api/utils/httpStatus.js';
import { UserSteps } from '../../api/utils/steps/userSteps';

const USER_SESSION_RE = /@UserSession\(amount=(\d+)\)/;

async function injectTokenAndGoto(page, { token, goto = '/' }) {
  if (!token) throw new Error('Authorization header is missing');

  await page.addInitScript(t => window.localStorage.setItem('authToken', t), token);

  try {
    await page.goto(goto);
  } catch (error) {
    const baseUrl = process.env.UI_BASE_URL || 'http://localhost';
    throw new Error(
      `Failed to open UI route "${goto}" using UI_BASE_URL="${baseUrl}". ` +
        'The frontend is likely not running or the URL is incorrect.',
      { cause: error },
    );
  }

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

  // "Annotation-style" session provisioning for UI tests:
  // Put `@UserSession(amount=1)` in the test title and use `userSession` fixture.
  userSession: [
    async ({ withUserSession, authWithToken }, use, testInfo) => {
      const m = String(testInfo?.title ?? '').match(USER_SESSION_RE);
      const amount = m ? Number(m[1]) : 0;

      if (!amount) {
        await use(null);
        return;
      }

      const [session] = await withUserSession(amount);
      await authWithToken({ token: session.token, goto: '/dashboard' });
      await use(session);
    },
    { scope: 'test' },
  ],
});

export const expect = test.expect;
