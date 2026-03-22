import { test, expect } from '../fixtures/adminSession';
import { AdminPanel } from '../pages/adminPanelPage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { AdminSteps } from '@/api/utils/steps/adminSteps';
import { CreateUserRequest } from '@/api/models/createUserRequset';
import { assertThatModels } from '../../api/models/comparison/modelAssertions.js';
import { URLS } from '../utils/urls.js';
import RandExp from 'randexp';

test.describe('Auth Servise Tests', () => {
  test('Admin should be able to create new user with correct data', async ({
    page,
    authAsAdmin,
  }) => {
    await authAsAdmin({ goto: URLS.ADMIN });

    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();

    const newUser = CreateUserRequest.generateUserData();
    await adminPanel.checkAlertAndAccept(BankAlert.SUCCESSFUL_USER_CREATION_ALERT_TEXT, () =>
      adminPanel.createUser(newUser.username, newUser.password),
    );

    await adminPanel.expectUserIsVisible(newUser.username);

    const { users } = await AdminSteps.getAllUsers();
    const createdUser = users.find(u => u.username === newUser.username);

    expect(createdUser, 'User must exist in backend list').toBeTruthy();

    const expected = new CreateUserRequest(newUser);

    await assertThatModels(expected, createdUser).match();
  });

  test('Admin should not be able to create new user with invalid data', async ({
    page,
    authAsAdmin,
  }) => {
    await authAsAdmin({ goto: URLS.ADMIN });

    const adminPanel = new AdminPanel(page);
    await adminPanel.expectAdminPanelVisible();

    const newUser = CreateUserRequest.generateUserData();
    newUser.username = new RandExp(/([A-Za-z0-9]{1,2} | [A-Za-z0-9] {16, })/).gen();

    await adminPanel.checkAlertAndAccept(
      BankAlert.USERNAME_MUST_BE_BETWEEN_3_AND_15_CHARACTERS,
      () => adminPanel.createUser(newUser.username, newUser.password),
    );

    await adminPanel.expectUserNotToExist(newUser.username);

    const { users } = await AdminSteps.getAllUsers();
    const sameNameCount = users.filter(u => u.username === newUser.username).length;

    expect(sameNameCount).toBe(0);
  });
});
