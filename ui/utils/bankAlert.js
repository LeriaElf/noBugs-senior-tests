export const BankAlert = Object.freeze({
  SUCCESSFUL_USER_CREATION_ALERT_TEXT: {
    message: '✅ User created successfully!',
  },
  USERNAME_MUST_BE_BETWEEN_3_AND_15_CHARACTERS: {
    message:
      '❌ Failed to create user:\n\n• username: Username must contain only letters, digits, dashes, underscores, and dots', //BUG
    // '❌ Failed to create user:\n\n• username: Username must be between 3 and 15 characters,Username must contain only letters, digits, dashes, underscores, and dots',
  },
  NEW_ACCOUNT_ADDED: { message: '✅ New Account Created! Account Number:' },
  DEPOSIT_SUCCESS: { message: '✅ Successfully deposited' },
  DEPOSIT_SELECT_ACC: { message: '❌ Please select an account.' },
  DEPOSIT_VALID_AMOUNT: { message: '❌ Please enter a valid amount.' },
  TRANSFER_SUCCESS: { message: '✅ Successfully transferred' },
  TRANSFER_FILL_ALL_FIELDS: {
    message: '❌ Please fill all fields and confirm.',
  },
  TRANSFER_WRONG_ACCOUNT: {
    message: '❌ No user found with this account number.',
  },
  TRANSFER_SAME_ACCOUNT: {
    message: '❌ You cannot transfer money to the same account.',
  },
  TRANSFER_WRONG_AMOUNT: {
    message: '❌ Error: Transfer amount must be at least 0.01',
  },
  TRANSFER_INVALID: {
    message: '❌ Error: Invalid transfer: insufficient funds or invalid accounts',
  },
  PROFILE_INVALID_NAME: {
    message: 'Name must contain two words with letters only',
  },
  PROFILE_SUCCESS: {
    message: '✅ Name updated successfully!',
  },
});
