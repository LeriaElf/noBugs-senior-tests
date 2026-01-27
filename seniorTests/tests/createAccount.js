import { AdminSteps } from "../utils/steps/adminSteps.js";
import { HTTP_STATUS } from "../utils/httpStatus.js";
import { expect } from "chai";
import { ENPOINT_KEY } from "../utils/enpoints.js";
import { requester } from "../utils/requester.js";
import { LoginUserRequest } from "../models/loginUserRequest.js";
import { ApiConfig } from "../utils/apiConfig.js";

describe("Account Servise tests", function () {
  it("User shoud be able to create account", async () => {
    const { requestData } = await AdminSteps.createUser();

    const username = requestData.username;
    const password = requestData.password;

    const { status: loginStatus, headers } = await requester.request(
      ENPOINT_KEY.LOGIN,
      { data: new LoginUserRequest({ username, password }) },
    );

    const token = headers.authorization;
    expect(loginStatus).to.equal(HTTP_STATUS.OK);

    const { data: accountCreateData, status: accountCreateStatus } =
      await requester.request(ENPOINT_KEY.ACCOUNTS, {
        data: null,
        config: ApiConfig.getUserAuth(token),
      });

    expect(accountCreateStatus).to.equal(HTTP_STATUS.CREATED);
    expect(accountCreateData.accountNumber).to.exist;
  });
});
