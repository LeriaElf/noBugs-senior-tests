import { assertThatModels } from '../../models/comparison/modelAssertions.js';
import { AdminSteps } from '../../utils/steps/adminSteps.js';
import { HTTP_STATUS } from '../../utils/httpStatus.js';
import { expect } from 'chai';
import { errorHandlingRequester } from '../../utils/errorHandlingRequester.js';
import { ExpectedError } from '../../models/expectedError.js';
import { ENDPOINT_KEY } from '../../utils/enpoints.js';
import { CreateUserRequest } from '../../models/createUserRequset.js';
import { ApiConfig } from '../../utils/apiConfig.js';
import { ADMIN_ERRORS, KEY_ERRORS, ROLE } from '../../utils/responseTitles.js';
import { RequestSpecs } from '../../utils/requestSpecs.js';
import { ResponseSpecs } from '../../utils/responseSpecs.js';
import { ValidatedRequester } from '../../utils/validatedRequester.js';
import { skipUnlessVersion } from '../../utils/apiVersion.js';

describe('Admin Servise tests', function () {
  let userId;
  const adminAuth = RequestSpecs.withConfig(ApiConfig.adminAuth);

  before(function () {
    if (skipUnlessVersion('with_validation_fix')) this.skip();
  });

  after(async () => {
    if (!userId) return;
    await AdminSteps.deleteUser(userId);
  });

  it('Admin shoud be able to create new user', async () => {
    const requestData = CreateUserRequest.generateUserData();

    const { data: responseData } = await new ValidatedRequester(
      adminAuth,
      ENDPOINT_KEY.ADMIN_CREATE_USER,
      ResponseSpecs.entityWasCreated(),
    ).post({
      data: requestData,
      stepName: `Create user with username "${requestData.username}" and password "${requestData.password}"`,
    });

    userId = responseData.id;
    await assertThatModels(requestData, responseData).match();

    const { data } = await new ValidatedRequester(
      adminAuth,
      ENDPOINT_KEY.ADMIN_GET_ALL_USERS,
      ResponseSpecs.okArrayBy('users'),
    ).get({ stepName: 'Get all users' });

    const { users } = data;
    expect(users.find(user => user.username === responseData.username)).to.exist;
  });

  const invalidDataUsername = [
    {
      username: '',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [
        ADMIN_ERRORS.NAME_BLANK,
        ADMIN_ERRORS.NAME_LENGTH,
        ADMIN_ERRORS.NAME_MUST_CONTAIN,
      ],
    },
    {
      username: ' ',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [
        ADMIN_ERRORS.NAME_BLANK,
        ADMIN_ERRORS.NAME_LENGTH,
        ADMIN_ERRORS.NAME_MUST_CONTAIN,
      ],
    },
    {
      username: 'qw',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [ADMIN_ERRORS.NAME_LENGTH],
    },
    {
      username: 'qweqweqweqweqweq',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [ADMIN_ERRORS.NAME_LENGTH],
    },
  ];

  invalidDataUsername.forEach(({ username, role, errorKey, errorMessages }) => {
    it(`Admin should not be able to create new user with invalid ${errorKey} - "${username}"`, async function () {
      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey,
        errorMessages,
      });

      const { users: usersBefore } = await AdminSteps.getAllUsers();
      const countBefore = usersBefore.length;

      await errorHandlingRequester.requestExpectingError(ENDPOINT_KEY.ADMIN_CREATE_USER, {
        data: CreateUserRequest.generateUserData({ username, role }),
        config: ApiConfig.adminAuth,
        expectedError,
      });

      const { users: usersAfter } = await AdminSteps.getAllUsers();
      const countAfter = usersAfter.length;
      expect(countAfter).to.equal(countBefore);
    });
  });

  const invalidDataPassword = [
    {
      password: '',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN, ADMIN_ERRORS.PASSWORD_BLANK],
    },
    {
      password: ' ',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN, ADMIN_ERRORS.PASSWORD_BLANK],
    },
    {
      password: 'qweQW1!',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN],
    },
    {
      password: 'qweqweqweqweqweq',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN],
    },
    {
      password: 'qweQWE 123!@#',
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN],
    },
  ];

  invalidDataPassword.forEach(({ password, role, errorKey, errorMessages }) => {
    it(`Admin should not be able to create new user with invalid ${errorKey} - "${password}"`, async function () {
      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey,
        errorMessages,
      });

      const { users: usersBefore } = await AdminSteps.getAllUsers();
      const countBefore = usersBefore.length;

      await errorHandlingRequester.requestExpectingError(ENDPOINT_KEY.ADMIN_CREATE_USER, {
        data: CreateUserRequest.generateUserData({ password, role }),
        config: ApiConfig.adminAuth,
        expectedError,
      });

      const { users: usersAfter } = await AdminSteps.getAllUsers();
      const countAfter = usersAfter.length;
      expect(countAfter).to.equal(countBefore);
    });
  });
});
