export async function setupSenderWithAccount(
  { withUserSession },
  numberOfAccounts = 1,
) {
  const [{ user, steps, token }] = await withUserSession(1);

  const accounts = [];

  for (let i = 0; i < numberOfAccounts; i++) {
    const resp = await steps.createAccount();
    const { balance } = await steps.depositeToAccount(resp.accountId);

    accounts.push({
      status: resp.status,
      accountNumber: resp.accountNumber,
      accountId: resp.accountId,
      balance,
    });
  }

  return {
    steps,
    token,
    userName: user.username,
    accounts,
  };
}
