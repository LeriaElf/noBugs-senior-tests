export const CUSTOMER_RESPONSE_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  NAME_ERROR: "Name must contain two words with letters only",
};

export const ADMIN_ERRORS = {
  NAME_BLANK: "Username cannot be blank",
  NAME_MUST_CONTAIN:
    "Username must contain only letters, digits, dashes, underscores, and dots",
  NAME_LENGTH: "Username must be between 3 and 15 characters",
  PASSWORD_MUST_CONTAIN:
    "Password must contain at least one digit, one lower case, one upper case, one special character, no spaces, and be at least 8 characters long",
  PASSWORD_BLANK: "Password cannot be blank",
};

export const DEPOSIT_RESPONSE_MESSAGES = {
  UNAUTHORASED_ACCESS: "Unauthorized access to account",
  SERVER_ERROR: "Internal Server Error",
};

export const DEPOSIT_ERRORS = {
  DEPOSIT_MIN: "Deposit amount must be at least 0.01",
  DEPOSIT_MAX: "Deposit amount cannot exceed 5000",
};

export const TRANSFER_ERRORS = {
  INVALID_TRANSFER: "Invalid transfer: insufficient funds or invalid accounts",
  TRANSFER_MAX: "Transfer amount cannot exceed 10000",
  TRANSFER_MIN: "Transfer amount must be at least 0.01",
};

export const KEY_ERRORS = {
  AMOUNT: "amount",
  ERROR: "error",
  USERNAME: "username",
  PASSWORD: "password",
};

export const ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
};
