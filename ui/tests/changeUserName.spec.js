import { test, expect } from '../fixtures/baseUi';
import { UserDashboard } from '../pages/userDashboard';
import { ProfilePage } from '../pages/profilePage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { PutCustomerProfileRequest } from '../../api/models/putCustomerProfileRequest.js';
import { generateInvalidName } from '../utils/generateInvalidName.js';
import { nonameUser } from '../utils/constants.js';

test.describe('Customer Servise tests', () => {
  test('User shoud be able to change profile name', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);
    const { name: correctName } = PutCustomerProfileRequest.generateProfileName();

    const { steps, userProfile } =
      await test.step('Precondition: create user, authorize', async () => {
        const [session] = await withUserSession(1);

        /** @type {import('../../api/utils/steps/userSteps').UserSteps} */
        const { steps, token } = session;

        await authWithToken({ token, goto: URLS.DASHBOARD });
        const { data } = await steps.getUserProfileData();

        const userDashboard = new UserDashboard(page);
        await userDashboard.expectLoaded();

        return { steps, userProfile: data };
      });

    await test.step('Change profile name', async () => {
      expect(await userDashboard.header.getUserUserName()).toBe(userProfile.username);
      expect(await userDashboard.header.getUserName()).toBe(nonameUser);
      expect(userDashboard.welcomeText).toContainText(nonameUser.toLowerCase());

      expect(userProfile.name).toBeNull();

      await userDashboard.header.userInfoClick();
      const profilePage = new ProfilePage(page);

      await profilePage.expectLoaded();
      await profilePage.fillName(correctName);
      await profilePage.checkAlertAndAccept(BankAlert.PROFILE_SUCCESS, () =>
        profilePage.saveButtonClick(),
      );

      //BUG: должен работать редирект на дашборд
      //   await userDashboard.expectLoaded()

      await profilePage.homeButtonClick();

      const { data } = await steps.getUserProfileData();
      expect(data.name).toBe(correctName);

      await page.reload();
      expect(await userDashboard.header.getUserName()).toBe(correctName);

      await expect
        .poll(async () => {
          return await userDashboard.getWelcomeName();
        })
        .toBe(correctName);

      await userDashboard.header.userInfoClick();
      await profilePage.expectLoaded();

      await expect
        .poll(async () => {
          return await profilePage.nameInput.inputValue();
        })
        .toBe(correctName);
    });
  });

  test('User shoud not be able to change profile name with invalid value', async ({
    page,
    withUserSession,
    authWithToken,
  }) => {
    const userDashboard = new UserDashboard(page);
    const incorrectName = generateInvalidName();

    const { steps } = await test.step('Precondition: create user, authorize', async () => {
      const [session] = await withUserSession(1);
      const { steps, token } = session;

      await authWithToken({ token, goto: URLS.DASHBOARD });

      const userDashboard = new UserDashboard(page);
      await userDashboard.expectLoaded();

      return { steps };
    });

    await test.step('Change profile name with invalid value', async () => {
      await userDashboard.header.userInfoClick();
      const profilePage = new ProfilePage(page);

      await profilePage.expectLoaded();
      await profilePage.fillName(incorrectName);

      await profilePage.checkAlertAndAccept(BankAlert.PROFILE_INVALID_NAME, () =>
        profilePage.saveButtonClick(),
      );

      await profilePage.homeButtonClick();
      expect(userDashboard.welcomeText).toContainText(nonameUser.toLowerCase());

      const { data } = await steps.getUserProfileData();
      expect(data.name).toBeNull();

      await page.reload();
      expect(await userDashboard.header.getUserName()).toBe(nonameUser);
    });
  });
});
