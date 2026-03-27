import { BaseModel } from '../models/baseModel.js';
import { AccountTransferResponse } from '../models/accountTransferResponse.js';
import { AccountTransferRequest } from '../models/accountTransferRequest.js';
import { AccountDepositRequest } from '../models/accountDepositRequest.js';
import { AccountDepositResponse } from '../models/accountDepositResponse.js';
import { CreateAccountResponse } from '../models/createAccountResponse.js';
import { CreateUserRequest } from '../models/createUserRequset.js';
import { CreateUserResponse } from '../models/createUserResponse.js';
import { LoginUserRequest } from '../models/loginUserRequest.js';
import { LoginUserResponse } from '../models/loginUserResponse.js';
import { CustomerAccountsResponse } from '../models/customerAccountsResponse.js';
import { GetCustomerProfileResponse } from '../models/getCustomerProfileResponse.js';
import { PutCustomerProfileRequest } from '../models/putCustomerProfileRequest.js';
import { PutCustomerProfileResponse } from '../models/putCustomerProfileResponse.js';
import { GetAllUsersResponse } from '../models/getAllUsersResponse.js';
import { GetTransactionRequest } from '../models/getTransactionRequest.js';
import { GetTransactionResponse } from '../models/getTransactionResponse.js';
import { DeleteUserResponse } from '../models/deleteUserResponse.js';

export const ENDPOINT_KEY = {
  ADMIN_CREATE_USER: 'ADMIN_CREATE_USER',
  ADMIN_GET_ALL_USERS: 'ADMIN_GET_ALL_USERS',
  ADMIN_DELETE_USER: 'ADMIN_DELETE_USER',
  LOGIN: 'LOGIN',
  ACCOUNTS_CREATE: 'ACCOUNTS_CREATE',
  ACCOUNTS_TRANSFER: 'ACCOUNTS_TRANSFER',
  ACCOUNTS_DEPOSIT: 'ACCOUNTS_DEPOSIT',
  ACCOUNTS_TRANSACTIONS: 'ACCOUNTS_TRANSACTIONS',
  CUSTOMER_PROFILE_GET: 'CUSTOMER_PROFILE_GET',
  CUSTOMER_PROFILE_PUT: 'CUSTOMER_PROFILE_PUT',
  CUSTOMER_ACCOUNTS: 'CUSTOMER_ACCOUNTS',
};

export const endpoints = {
  [ENDPOINT_KEY.ADMIN_CREATE_USER]: {
    url: '/admin/users',
    method: 'post',
    requestModel: CreateUserRequest,
    responseModel: CreateUserResponse,
  },
  [ENDPOINT_KEY.ADMIN_GET_ALL_USERS]: {
    url: '/admin/users',
    method: 'get',
    requestModel: BaseModel,
    responseModel: GetAllUsersResponse,
  },
  [ENDPOINT_KEY.ADMIN_DELETE_USER]: {
    url: userId => `/admin/users/${userId}`,
    templateUrl: '/admin/users/{id}',
    method: 'delete',
    requestModel: BaseModel,
    responseModel: DeleteUserResponse,
  },
  [ENDPOINT_KEY.LOGIN]: {
    url: '/auth/login',
    method: 'post',
    requestModel: LoginUserRequest,
    responseModel: LoginUserResponse,
  },
  [ENDPOINT_KEY.ACCOUNTS_CREATE]: {
    url: '/accounts',
    method: 'post',
    requestModel: BaseModel,
    responseModel: CreateAccountResponse,
  },
  [ENDPOINT_KEY.ACCOUNTS_TRANSFER]: {
    url: '/accounts/transfer',
    method: 'post',
    requestModel: AccountTransferRequest,
    responseModel: AccountTransferResponse,
  },
  [ENDPOINT_KEY.ACCOUNTS_DEPOSIT]: {
    url: '/accounts/deposit',
    method: 'post',
    requestModel: AccountDepositRequest,
    responseModel: AccountDepositResponse,
  },
  [ENDPOINT_KEY.ACCOUNTS_TRANSACTIONS]: {
    url: accountId => `/accounts/${accountId}/transactions`,
    templateUrl: '/accounts/{accountId}/transactions',
    method: 'get',
    requestModel: GetTransactionRequest,
    responseModel: GetTransactionResponse,
  },
  [ENDPOINT_KEY.CUSTOMER_PROFILE_GET]: {
    url: '/customer/profile',
    method: 'get',
    requestModel: BaseModel,
    responseModel: GetCustomerProfileResponse,
  },
  [ENDPOINT_KEY.CUSTOMER_PROFILE_PUT]: {
    url: '/customer/profile',
    method: 'put',
    requestModel: PutCustomerProfileRequest,
    responseModel: PutCustomerProfileResponse,
  },
  [ENDPOINT_KEY.CUSTOMER_ACCOUNTS]: {
    url: '/customer/accounts',
    method: 'get',
    requestModel: BaseModel,
    responseModel: CustomerAccountsResponse,
  },
};
