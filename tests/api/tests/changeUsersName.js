import { expect } from 'chai';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../../utils/httpStatus.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { userSteps } from '../../utils/fixtures.js';
import { errorHandlingRequester } from '../../utils/errorHandlingRequester.js';
import { ExpectedError } from '../../models/expectedError.js';
import { PutCustomerProfileRequest } from '../../models/putCustomerProfileRequest.js';
import { CUSTOMER_RESPONSE_MESSAGES } from '../../utils/responseTitles.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { isApiVersion } from '../../utils/apiVersion.js';

describe('Customer Servise tests', function () {
  let token;
  let auth;
  let userId;

  before(function () {
    if (isApiVersion('with_fraud_check')) this.skip();
  });

  before(async () => {
    const { requestData, responseData } = await AdminSteps.createUser();
    const response = await userSteps.loginUser(requestData.username, requestData.password);
    expect(response.status).to.equal(HTTP_STATUS.OK);
    token = response.token;
    auth = RequestSpecs.withConfig(ApiConfig.getUserAuth(token));

    userId = responseData.id;
  });

  after(async () => {
    if (!userId) return;
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to get customer profile', async () => {
    const { data: profileData } = await new ValidatedRequester(
      auth,
      ENDPOINT_KEY.CUSTOMER_PROFILE_GET,
      ResponseSpecs.status(HTTP_STATUS.OK),
    ).get({ stepName: 'Get customer profile' });

    expect(profileData.name).to.be.null;
  });

  it('User shoud be able to change profile name', async () => {
    const profileName = PutCustomerProfileRequest.generateProfileName();

    const { data: profileData } = await new ValidatedRequester(
      auth,
      ENDPOINT_KEY.CUSTOMER_PROFILE_PUT,
      ResponseSpecs.status(HTTP_STATUS.OK),
    ).put({ data: profileName, stepName: `Update profile name to "${profileName.name}"` });

    expect(profileData.message).to.equal(CUSTOMER_RESPONSE_MESSAGES.PROFILE_UPDATED);
    expect(profileData.customer.name).to.equal(profileName.name);

    const { data: newUserData } = await userSteps.getUserProfileData(token);
    expect(newUserData.name).to.equal(profileName.name);
  });

  const validNames = ['Qwe Wqe', 'Qweqweqweqweqwe Qweqweqweqweqwe', 'QWE QWE', 'qwe qwe'];

  validNames.forEach(name => {
    it(`User shoud be able to change profile name with - "${name}"`, async () => {
      const { data: profileData } = await new ValidatedRequester(
        auth,
        ENDPOINT_KEY.CUSTOMER_PROFILE_PUT,
        ResponseSpecs.status(HTTP_STATUS.OK),
      ).put({
        data: new PutCustomerProfileRequest({ name }),
        stepName: `Update profile name to "${name}"`,
      });

      expect(profileData.message).to.equal(CUSTOMER_RESPONSE_MESSAGES.PROFILE_UPDATED);
      expect(profileData.customer.name).to.equal(name);

      const { data: newUserData } = await userSteps.getUserProfileData(token);
      expect(newUserData.name).to.equal(name);
    });
  });

  const invalidNames = [
    '',
    ' ',
    // 'A A',
    // 'Al Al',
    'Alice \nAlice',
    'Alice \tAlice',
    ' Alice Alice',
    // 'QweqweqweqQweqweqweqQweqweqweqQweqweqweqQweqweqweqq QweqweqweqQweqweqweqQweqweqweqQweqweqweqQweqweqweqq',
    'Élise Qwe',
    'Alice',
    'Alice1 Alice',
    'Alice! Alice',
    'Alice  Alice',
  ];

  invalidNames.forEach(name => {
    it(`User shoud not be able to change profile name with - "${name}"`, async () => {
      const requestData = new PutCustomerProfileRequest({ name });

      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorMessages: CUSTOMER_RESPONSE_MESSAGES.NAME_ERROR,
      });

      await errorHandlingRequester.requestExpectingError(ENDPOINT_KEY.CUSTOMER_PROFILE_PUT, {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
        expectedError,
      });

      const { data: newUserData } = await userSteps.getUserProfileData(token);
      expect(newUserData.name).not.to.equal(name);
    });
  });
});
