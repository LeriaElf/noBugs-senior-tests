import { test, expect } from '../fixtures/baseUi';
import { UserDashboard } from '../pages/userDashboard';
import { ProfilePage } from '../pages/profilePage.js';
import { BankAlert } from '../utils/bankAlert.js';
import { URLS } from '../utils/urls.js';
import { PutCustomerProfileRequest } from '../../api/models/putCustomerProfileRequest.js';
import { generateInvalidName } from '../utils/generateInvalidName.js';
import { nonameUser } from '../utils/constants.js';
import { ApiConfig } from '../../api/utils/apiConfig.js';
import { ENDPOINT_KEY } from '../../api/utils/enpoints.js';
import { ValidatedRequester } from '../../api/utils/validatedRequester.js';
import { RequestSpecs } from '../../api/utils/requestSpecs.js';
import { ResponseSpecs } from '../../api/utils/responseSpecs.js';

test.describe('Customer Servise tests', () => {
  test('@UserSession(amount=1); User shoud be able to change profile name', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);
    const { name: correctName } = PutCustomerProfileRequest.generateProfileName();
    const userAuth = ApiConfig.getUserAuth(userSession.token);

    const { userProfile } = await test.step('Precondition: open dashboard for authorized user', async () => {
      await page.goto(URLS.DASHBOARD);
      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_PROFILE_GET,
        ResponseSpecs.ok(),
      ).get();

      const userDashboard = new UserDashboard(page);
      await userDashboard.expectLoaded();

      return { userProfile: data };
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

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_PROFILE_GET,
        ResponseSpecs.ok(),
      ).get();
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

  test('@UserSession(amount=1); User shoud not be able to change profile name with invalid value', async ({
    page,
    userSession,
  }) => {
    const userDashboard = new UserDashboard(page);
    const incorrectName = generateInvalidName();
    const userAuth = ApiConfig.getUserAuth(userSession.token);

    await test.step('Precondition: open dashboard for authorized user', async () => {
      await page.goto(URLS.DASHBOARD);

      const userDashboard = new UserDashboard(page);
      await userDashboard.expectLoaded();
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

      const { data } = await new ValidatedRequester(
        RequestSpecs.withConfig(userAuth),
        ENDPOINT_KEY.CUSTOMER_PROFILE_GET,
        ResponseSpecs.ok(),
      ).get();
      expect(data.name).toBeNull();

      await page.reload();
      expect(await userDashboard.header.getUserName()).toBe(nonameUser);
    });
  });
});
