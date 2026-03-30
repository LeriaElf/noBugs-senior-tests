import { test, expect } from '../fixtures/baseUi.js';
import { AdminPanel } from '../pages/adminPanelPage.js';
import { UserDashboard } from '../pages/userDashboard.js';
import { LoginPage } from '../pages/loginPage.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe('Login Service Tests', () => {
  test('Admin should be able to login with correct credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);

    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();
  });

  test('@UserSession(amount=1); User should be able to login with correct credentials', async ({
    page,
    userSession,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(userSession.user.username, userSession.user.password);

    const userDashBoard = new UserDashboard(page);
    await userDashBoard.expectLoaded();
    expect(userDashBoard.welcomeText).toContainText('noname');
  });
});
