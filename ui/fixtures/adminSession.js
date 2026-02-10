import { test as base } from "../fixtures/baseUi";
import { ApiConfig } from "@/seniorTests/utils/apiConfig";

function getAdminToken() {
  const headers = ApiConfig.adminAuth?.headers ?? {}; // зачем если там просто из енв берется?
  const token = headers.Authorization;

  if (!token) {
    throw new Error("Admin token is missing in ApiConfig.auth.headers");
  }

  return token;
}

// function getAdminToken() {
//   const token = process.env.ADMIN_TOKEN;
//   if (!token) throw new Error("ADMIN_TOKEN not set in env");
//   return token;
// }

export const test = base.extend({
  authAsAdmin: async ({ page }, use) => {
    async function authAsAdmin({ goto } = {}) {
      const token = getAdminToken();

      if (goto) {
        await page.addInitScript(
          (t) => localStorage.setItem("authToken", t),
          token,
        );
        await page.goto(goto);
      }
      return token;
    }
    await use(authAsAdmin);
  },
});

export const expect = test.expect;
