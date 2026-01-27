import { BaseModel } from "../models/baseModel.js";
import { AccountTransferResponse } from "../models/accountTransferResponse.js";
import { AccountTransferRequest } from "../models/accountTransferRequest.js";
import { AccountDepositRequest } from "../models/accountDepositRequest.js";
import { AccountDepositResponse } from "../models/accountDepositResponse.js";
import { CreateAccountResponse } from "../models/createAccountResponse.js";
import { CreateUserRequest } from "../models/createUserRequset.js";
import { CreateUserResponse } from "../models/createUserResponse.js";
import { LoginUserRequest } from "../models/loginUserRequest.js";
import { LoginUserResponse } from "../models/loginUserResponse.js";
import { CustomerAccountsResponse } from "../models/customerAccountsResponse.js";
import { GetCustomerProfileResponse } from "../models/getCustomerProfileResponse.js";
import { PutCustomerProfileRequest } from "../models/putCustomerProfileRequest.js";
import { PutCustomerProfileResponse } from "../models/putCustomerProfileResponse.js";

export const ENPOINT_KEY = {
  ADMIN_USER: "ADMIN_USER",
  LOGIN: "LOGIN",
  ACCOUNTS: "ACCOUNTS",
  ACCOUNTS_TRANSFER: "ACCOUNTS_TRANSFER",
  ACCOUNTS_DEPOSIT: "ACCOUNTS_DEPOSIT",
  CUSTOMER_PROFILE_GET: "CUSTOMER_PROFILE_GET",
  CUSTOMER_PROFILE_PUT: "CUSTOMER_PROFILE_PUT",
  CUSTOMER_ACCOUNTS: "CUSTOMER_ACCOUNTS",
};

export const endpoints = {
  [ENPOINT_KEY.ADMIN_USER]: {
    url: "/admin/users",
    method: "post",
    requestModel: CreateUserRequest,
    responseModel: CreateUserResponse,
  },
  [ENPOINT_KEY.LOGIN]: {
    url: "/auth/login",
    method: "post",
    requestModel: LoginUserRequest,
    responseModel: LoginUserResponse,
  },
  [ENPOINT_KEY.ACCOUNTS]: {
    url: "/accounts",
    method: "post",
    requestModel: BaseModel,
    responseModel: CreateAccountResponse,
  },
  [ENPOINT_KEY.ACCOUNTS_TRANSFER]: {
    url: "/accounts/transfer",
    method: "post",
    requestModel: AccountTransferRequest,
    responseModel: AccountTransferResponse,
  },
  [ENPOINT_KEY.ACCOUNTS_DEPOSIT]: {
    url: "/accounts/deposit",
    method: "post",
    requestModel: AccountDepositRequest,
    responseModel: AccountDepositResponse,
  },
  [ENPOINT_KEY.CUSTOMER_PROFILE_GET]: {
    url: "/customer/profile",
    method: "get",
    requestModel: BaseModel,
    responseModel: GetCustomerProfileResponse,
  },
  [ENPOINT_KEY.CUSTOMER_PROFILE_PUT]: {
    url: "/customer/profile",
    method: "put",
    requestModel: PutCustomerProfileRequest,
    responseModel: PutCustomerProfileResponse,
  },
  [ENPOINT_KEY.CUSTOMER_ACCOUNTS]: {
    url: "/customer/accounts",
    method: "get",
    requestModel: BaseModel,
    responseModel: CustomerAccountsResponse,
  },
};
