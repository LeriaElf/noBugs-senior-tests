const transactionSchema = {
  type: 'object',
  required: ['id', 'amount', 'type', 'timestamp'],
  properties: {
    id: { type: 'integer' },
    amount: { type: 'number' },
    type: { type: 'string' },
    timestamp: { type: 'string' },
    relatedAccountId: { type: 'integer' },
    accountId: { type: 'integer' },
  },
  additionalProperties: true,
};

const accountSchema = {
  type: 'object',
  required: ['id', 'accountNumber', 'balance', 'transactions'],
  properties: {
    id: { type: 'integer' },
    accountNumber: { type: 'string' },
    balance: { type: 'number' },
    transactions: {
      type: 'array',
      items: transactionSchema,
    },
  },
  additionalProperties: true,
};

export const createUserResponseSchema = {
  type: 'object',
  required: ['id', 'username', 'password', 'role'],
  properties: {
    id: { type: 'integer' },
    username: { type: 'string', minLength: 3, maxLength: 15 },
    password: { type: 'string' },
    name: { type: ['string', 'null'] },
    role: { type: 'string' },
    accounts: { type: 'array' },
  },
  additionalProperties: false,
};

export const loginUserResponseSchema = {
  type: 'object',
  required: ['username', 'role'],
  properties: {
    username: { type: 'string' },
    role: { type: 'string' },
  },
  additionalProperties: false,
};

export const createAccountResponseSchema = {
  type: 'object',
  required: ['id', 'accountNumber', 'balance'],
  properties: {
    id: { type: 'integer' },
    accountNumber: { type: 'string' },
    balance: { type: 'number' },
    transactions: {
      type: 'array',
      items: transactionSchema,
    },
  },
  additionalProperties: true,
};

export const accountDepositResponseSchema = {
  anyOf: [
    accountSchema,
    { type: 'array' },
    { type: 'string' },
    { type: 'null' },
    { type: 'number' },
    { type: 'boolean' },
  ],
};

export const depositResponseSchema = {
  type: 'object',
  required: ['id', 'accountNumber', 'balance'],
  properties: {
    id: { type: 'integer' },
    accountNumber: { type: 'string' },
    balance: { type: 'number' },
    depositAmount: { type: 'number' },
    transactionId: { type: 'integer' },
    transactions: {
      type: 'array',
      items: transactionSchema,
    },
  },
  additionalProperties: true,
};

export const accountTransferResponseSchema = {
  type: 'object',
  required: ['receiverAccountId', 'senderAccountId', 'message', 'amount'],
  properties: {
    status: { type: 'string' },
    receiverAccountId: { type: 'integer' },
    senderAccountId: { type: 'integer' },
    message: { type: 'string' },
    amount: { type: 'number' },
    fraudRiskScore: { type: 'number' },
    fraudReason: { type: 'string' },
    requiresManualReview: { type: 'boolean' },
    requiresVerification: { type: 'boolean' },
  },
  additionalProperties: true,
};

export const getCustomerProfileResponseSchema = {
  type: 'object',
  required: ['id', 'username', 'password', 'role'],
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    password: { type: 'string' },
    name: { type: ['string', 'null'] },
    role: { type: 'string' },
    accounts: {
      type: 'array',
      items: accountSchema,
    },
  },
  additionalProperties: false,
};

export const putCustomerProfileResponseSchema = {
  type: 'object',
  required: ['message', 'customer'],
  properties: {
    message: { type: 'string' },
    customer: getCustomerProfileResponseSchema,
  },
  additionalProperties: false,
};

export const customerAccountsResponseSchema = {
  anyOf: [
    {
      type: 'array',
      items: accountSchema,
    },
    {
      type: 'object',
      required: ['accounts'],
      properties: {
        accounts: {
          type: 'array',
          items: accountSchema,
        },
      },
      additionalProperties: true,
    },
  ],
};

export const responseSchemaMap = {
  CreateUserResponse: createUserResponseSchema,
  LoginUserResponse: loginUserResponseSchema,
  CreateAccountResponse: createAccountResponseSchema,
  AccountDepositResponse: accountDepositResponseSchema,
  DepositResponse: depositResponseSchema,
  AccountTransferResponse: accountTransferResponseSchema,
  GetCustomerProfileResponse: getCustomerProfileResponseSchema,
  PutCustomerProfileResponse: putCustomerProfileResponseSchema,
  CustomerAccountsResponse: customerAccountsResponseSchema,
};
