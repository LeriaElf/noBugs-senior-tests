export const BankAlert = Object.freeze({
  SUCCESSFUL_USER_CREATION_ALERT_TEXT: {
    message: "✅ User created successfully!",
  },
  USERNAME_MUST_BE_BETWEEN_3_AND_15_CHARACTERS: {
    // message: "Username must be between 3 and 15 characters",
    message:
      "❌ Failed to create user:\n\n• username: Username must contain only letters, digits, dashes, underscores, and dots",
  },
  NEW_ACCOUNT_ADDED: { message: "✅ New Account Created! Account Number:" },
});
