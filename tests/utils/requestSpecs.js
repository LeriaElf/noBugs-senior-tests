import { ApiConfig } from './apiConfig.js';

export const RequestSpecs = {
  authAsUser(username, password) {
    return {
      async buildConfig() {
        return await ApiConfig.authAsUser({ username, password });
      },
    };
  },

  authAsUserData(userData) {
    return {
      async buildConfig() {
        return await ApiConfig.authAsUser(userData);
      },
    };
  },

  withConfig(config) {
    return {
      async buildConfig() {
        return await config;
      },
    };
  },
};
