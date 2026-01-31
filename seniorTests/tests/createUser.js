import { assertThatModels } from "../models/comparison/modelAssertions.js";
import { AdminSteps } from "../utils/steps/adminSteps.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { expect } from "chai";
import { errorHandlingRequester } from "../utils/errorHandlingRequester.js";
import { ExpectedError } from "../models/expectedError.js";
import { ENPOINT_KEY } from "../utils/enpoints.js";
import { CreateUserRequest } from "../models/createUserRequset.js";
import { ApiConfig } from "../utils/apiConfig.js";
import { ADMIN_ERRORS, KEY_ERRORS, ROLE } from "../utils/responseSpec.js";

describe("Admin Servise tests", function () {
  it("Admin shoud be able to create new user", async () => {
    const { requestData, responseData, status } = await AdminSteps.createUser();

    expect(status).to.equal(HTTP_STATUS.CREATED);
    await assertThatModels(requestData, responseData).match();
  });

  const invalidDataUsername = [
    {
      username: "",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [
        ADMIN_ERRORS.NAME_BLANK,
        ADMIN_ERRORS.NAME_LENGTH,
        ADMIN_ERRORS.NAME_MUST_CONTAIN,
      ],
    },
    {
      username: " ",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [
        ADMIN_ERRORS.NAME_BLANK,
        ADMIN_ERRORS.NAME_LENGTH,
        ADMIN_ERRORS.NAME_MUST_CONTAIN,
      ],
    },
    {
      username: "qw",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.USERNAME,
      errorMessages: [ADMIN_ERRORS.NAME_LENGTH],
    },
    {
      username: "qweqweqweqweqweq",
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

      await errorHandlingRequester.requestExpectingError(
        ENPOINT_KEY.ADMIN_USER,
        {
          data: CreateUserRequest.generateUserData({ username, role }),
          config: ApiConfig.adminAuth,
          expectedError,
        },
      );
    });
  });

  const invalidDataPassword = [
    {
      password: "",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [
        ADMIN_ERRORS.PASSWORD_MUST_CONTAIN,
        ADMIN_ERRORS.PASSWORD_BLANK,
      ],
    },
    {
      password: " ",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [
        ADMIN_ERRORS.PASSWORD_MUST_CONTAIN,
        ADMIN_ERRORS.PASSWORD_BLANK,
      ],
    },
    {
      password: "qweQW1!",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN],
    },
    {
      password: "qweqweqweqweqweq",
      role: ROLE.USER,
      errorKey: KEY_ERRORS.PASSWORD,
      errorMessages: [ADMIN_ERRORS.PASSWORD_MUST_CONTAIN],
    },
    {
      password: "qweQWE 123!@#",
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

      await errorHandlingRequester.requestExpectingError(
        ENPOINT_KEY.ADMIN_USER,
        {
          data: CreateUserRequest.generateUserData({ password, role }),
          config: ApiConfig.adminAuth,
          expectedError,
        },
      );
    });
  });
});
