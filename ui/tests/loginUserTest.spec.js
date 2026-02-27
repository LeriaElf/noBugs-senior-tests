import { AdminSteps } from "@/api/utils/steps/adminSteps";
import { test, expect } from "../fixtures/baseUi";
import { AdminPanel } from "../pages/adminPanelPage.js";
import { UserDashboard } from "../pages/userDashboard.js";
import { LoginPage } from "../pages/loginPage.js";
import { HTTP_STATUS } from "@/api/utils/httpStatus";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe("Login Service Tests", async () => {
  test("Admin should be able to login with correct credentials", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);

    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();
  });

  test("User should be able to login with correct credentials", async ({
    page,
  }) => {
    const { requestData, status } = await AdminSteps.createUser();
    expect(status).toBe(HTTP_STATUS.CREATED);

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(requestData.username, requestData.password);

    const userDashBoard = new UserDashboard(page);
    await userDashBoard.expectLoaded();
    expect(userDashBoard.welcomeText).toContainText("noname");
  });
});
