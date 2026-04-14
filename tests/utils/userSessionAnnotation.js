import { AdminSteps } from './steps/adminSteps.js';

const USER_SESSION_RE = /@UserSession\(amount=(\d+)\)/;

export function parseUserSessionAmount(title = '') {
  const m = String(title).match(USER_SESSION_RE);
  if (!m) return 0;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function createUsersByAdmin(amount = 1) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return [];

  const users = [];
  for (let i = 0; i < n; i++) {
    const { requestData } = await AdminSteps.createUser();
    users.push(requestData);
  }
  return users;
}

export async function cleanupUsersByAdmin(users = []) {
  for (const u of users) {
    if (u?.id) {
      await AdminSteps.deleteUser(u.id);
    }
  }
}

// "Annotation-like" helper for Mocha without TS/Babel decorators:
// it('...', UserSession({ amount: 1 })(async (users) => { ... }))
export function UserSession({ amount = 1 } = {}) {
  return testFn =>
    async function () {
      const users = await createUsersByAdmin(amount);
      try {
        return await testFn(users);
      } finally {
        await cleanupUsersByAdmin(users);
      }
    };
}
