import { test as base } from '@playwright/test';
import { UserSteps } from '../../utils/steps/userSteps.js';

function createSessionStorage() {
  const map = new Map();
  const byUserName = new Map();

  return {
    addUsers(users = []) {
      for (const user of users) {
        const steps = new UserSteps({
          username: user.username,
          password: user.password,
        });
        map.set(user, steps);
        byUserName.set(user.username, { user, steps });
      }
    },

    getAllUsers() {
      return Array.from(map.keys());
    },

    getAllSteps() {
      return Array.from(map.values());
    },

    getUser(index = 0) {
      return this.getAllUsers()[index];
    },

    getStep(index = 0) {
      return this.getAllSteps()[index];
    },

    getStepsByUser(user) {
      return map.get(user);
    },

    getByUsername(username) {
      return byUserName.get(username);
    },

    size() {
      return map.size;
    },

    clear() {
      map.clear();
      byUserName.clear();
    },
  };
}

export const test = base.extend({
  sessionStorage: [
    async ({}, use) => {
      const store = createSessionStorage();
      await use(store);

      store.clear();
    },
    { scope: 'worker' },
  ],
});
