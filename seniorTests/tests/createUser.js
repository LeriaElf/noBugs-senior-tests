import { assertThatModels } from "../models/comparison/modelAssertions.js";
import { AdminSteps } from "../utils/steps/adminSteps.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { expect } from "chai";
import { errorHandlingRequester } from "../utils/errorHandlingRequester.js";
import { ExpectedError } from "../models/expectedError.js";
import { ENPOINT_KEY } from "../utils/enpoints.js";
import { CreateUserRequest } from "../models/createUserRequset.js";
import { ApiConfig } from "../utils/apiConfig.js";

describe("Admin Servise tests", function () {
  it("Admin shoud be able to create new user", async () => {
    const { requestData, responseData, status } = await AdminSteps.createUser();

    expect(status).to.equal(HTTP_STATUS.CREATED);
    await assertThatModels(requestData, responseData).match();
  });

  const invalidDataUsername = [
    {
      username: "",
      role: "USER",
      errorKey: "username",
      errorMessages: [
        "Username cannot be blank",
        "Username must contain only letters, digits, dashes, underscores, and dots",
        "Username must be between 3 and 15 characters",
      ],
    },
    {
      username: " ",
      role: "USER",
      errorKey: "username",
      errorMessages: [
        "Username cannot be blank",
        "Username must contain only letters, digits, dashes, underscores, and dots",
        "Username must be between 3 and 15 characters",
      ],
    },
    {
      username: "qw",
      role: "USER",
      errorKey: "username",
      errorMessages: ["Username must be between 3 and 15 characters"],
    },
    {
      username: "qweqweqweqweqweq",
      role: "USER",
      errorKey: "username",
      errorMessages: ["Username must be between 3 and 15 characters"],
    },
  ];

  invalidDataUsername.forEach(({ username, role, errorKey, errorMessages }) => {
    it(`Admin should not be able to create new user with invalid ${errorKey} - "${username}"`, async function () {
      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey,
        errorMessages,
      });

      await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.ADMIN_USER, {
        data: CreateUserRequest.generateUserData({ username, role }),
        config: ApiConfig.adminAuth,
        expectedError,
      });
    });
  });

  const invalidDataPassword = [
    {
      password: "",
      role: "USER",
      errorKey: "password",
      errorMessages: [
        "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
        "Password cannot be blank",
      ],
    },
    {
      password: " ",
      role: "USER",
      errorKey: "password",
      errorMessages: [
        "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
        "Password cannot be blank",
      ],
    },
    {
      password: "qweQW1!",
      role: "USER",
      errorKey: "password",
      errorMessages: [
        "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
      ],
    },
    {
      password: "qweqweqweqweqweq",
      role: "USER",
      errorKey: "password",
      errorMessages: [
        "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
      ],
    },
    {
      password: "qweQWE 123!@#",
      role: "USER",
      errorKey: "password",
      errorMessages: [
        "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
      ],
    },
  ];

  invalidDataPassword.forEach(({ password, role, errorKey, errorMessages }) => {
    it(`Admin should not be able to create new user with invalid ${errorKey} - "${password}"`, async function () {
      const expectedError = new ExpectedError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        errorKey,
        errorMessages,
      });

      await errorHandlingRequester.requestExpectingError(ENPOINT_KEY.ADMIN_USER, {
        data: CreateUserRequest.generateUserData({ password, role }),
        config: ApiConfig.adminAuth,
        expectedError,
      });
    });
  });
});
