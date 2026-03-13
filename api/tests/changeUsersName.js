import { expect } from 'chai';
import { AdminSteps } from '../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { ENPOINT_KEY } from '../utils/enpoints.js';
import { requester } from '../utils/requester.js';
import { ApiConfig } from '../utils/apiConfig.js';
import { userSteps } from '../utils/fixtures.js';
import { errorHandlingRequester } from '../utils/errorHandlingRequester.js';
import { ExpectedError } from '../models/expectedError.js';
import { PutCustomerProfileRequest } from '../models/putCustomerProfileRequest.js';
import { CUSTOMER_RESPONSE_MESSAGES } from '../utils/responseSpec.js';

describe('Customer Servise tests', function () {
  let token;
  let userId;

  before(async () => {
    const { requestData, responseData } = await AdminSteps.createUser();
    const response = await userSteps.loginUser(requestData.username, requestData.password);
    token = response.token;
    userId = responseData.id;
  });

  after(async () => {
    await AdminSteps.deleteUser(userId);
  });

  it('User shoud be able to get customer profile', async () => {
    const { status, data } = await requester.request(ENPOINT_KEY.CUSTOMER_PROFILE_GET, {
      config: ApiConfig.getUserAuth(token),
      stepName: 'Get customer profile',
    });

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(data.name).to.be.null;
  });

  it('User shoud be able to change profile name', async () => {
    const profileName = PutCustomerProfileRequest.generateProfileName();

    const { status, data } = await requester.request(ENPOINT_KEY.CUSTOMER_PROFILE_PUT, {
      data: profileName,
      config: ApiConfig.getUserAuth(token),
      stepName: `Update profile name to "${profileName.name}"`,
    });

    expect(status).to.equal(HTTP_STATUS.OK);
    expect(data.message).to.equal(CUSTOMER_RESPONSE_MESSAGES.PROFILE_UPDATED);
    expect(data.customer.name).to.equal(profileName.name);

    const { data: newUserData } = await userSteps.getUserProfileData(token);
    expect(newUserData.name).to.equal(profileName.name);
  });

  const validNames = ['Qwe Wqe', 'Qweqweqweqweqwe Qweqweqweqweqwe', 'QWE QWE', 'qwe qwe'];

  validNames.forEach(name => {
    it(`User shoud be able to change profile name with - "${name}"`, async () => {
      const { status, data } = await requester.request(ENPOINT_KEY.CUSTOMER_PROFILE_PUT, {
        data: new PutCustomerProfileRequest({ name }),
        config: ApiConfig.getUserAuth(token),
        stepName: `Update profile name to "${name}"`,
      });

      expect(status).to.equal(HTTP_STATUS.OK);
      expect(data.message).to.equal(CUSTOMER_RESPONSE_MESSAGES.PROFILE_UPDATED);
      expect(data.customer.name).to.equal(name);

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

      await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.CUSTOMER_PROFILE_PUT, {
        data: requestData,
        config: ApiConfig.getUserAuth(token),
        expectedError,
      });

      const { data: newUserData } = await userSteps.getUserProfileData(token);
      expect(newUserData.name).not.to.equal(name);
    });
  });
});
