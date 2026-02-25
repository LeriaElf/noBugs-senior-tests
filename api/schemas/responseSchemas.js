const transactionSchema = {
  type: "object",
  required: ["id", "amount", "type", "timestamp", "relatedAccountId"],
  properties: {
    id: { type: "integer" },
    amount: { type: "number" },
    type: { type: "string" },
    timestamp: { type: "string" },
    relatedAccountId: { type: "integer" },
  },
  additionalProperties: false,
};

const accountSchema = {
  type: "object",
  required: ["id", "accountNumber", "balance", "transactions"],
  properties: {
    id: { type: "integer" },
    accountNumber: { type: "string" },
    balance: { type: "number" },
    transactions: {
      type: "array",
      items: transactionSchema,
    },
  },
  additionalProperties: false,
};

export const createUserResponseSchema = {
  type: "object",
  required: ["id", "username", "password", "role"],
  properties: {
    id: { type: "integer" },
    username: { type: "string", minLength: 3, maxLength: 15 },
    password: { type: "string" },
    name: { type: ["string", "null"] },
    role: { type: "string" },
    accounts: { type: "array" },
  },
  additionalProperties: false,
};

export const loginUserResponseSchema = {
  type: "object",
  required: ["username", "role"],
  properties: {
    username: { type: "string" },
    role: { type: "string" },
  },
  additionalProperties: false,
};

export const createAccountResponseSchema = {
  ...accountSchema,
};

export const accountDepositResponseSchema = {
  ...accountSchema,
};

export const accountTransferResponseSchema = {
  type: "object",
  required: ["receiverAccountId", "senderAccountId", "message", "amount"],
  properties: {
    receiverAccountId: { type: "integer" },
    senderAccountId: { type: "integer" },
    message: { type: "string" },
    amount: { type: "number" },
  },
  additionalProperties: false,
};

export const getCustomerProfileResponseSchema = {
  type: "object",
  required: ["id", "username", "password", "role"],
  properties: {
    id: { type: "integer" },
    username: { type: "string" },
    password: { type: "string" },
    name: { type: ["string", "null"] },
    role: { type: "string" },
    accounts: {
      type: "array",
      items: accountSchema,
    },
  },
  additionalProperties: false,
};

export const putCustomerProfileResponseSchema = {
  type: "object",
  required: ["message", "customer"],
  properties: {
    message: { type: "string" },
    customer: getCustomerProfileResponseSchema,
  },
  additionalProperties: false,
};

export const customerAccountsResponseSchema = {
  type: "array",
  items: accountSchema,
};

export const responseSchemaMap = {
  CreateUserResponse: createUserResponseSchema,
  LoginUserResponse: loginUserResponseSchema,
  CreateAccountResponse: createAccountResponseSchema,
  AccountDepositResponse: accountDepositResponseSchema,
  AccountTransferResponse: accountTransferResponseSchema,
  GetCustomerProfileResponse: getCustomerProfileResponseSchema,
  PutCustomerProfileResponse: putCustomerProfileResponseSchema,
  CustomerAccountsResponse: customerAccountsResponseSchema,
};
