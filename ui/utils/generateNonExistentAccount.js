export function generateNonExistentAccount(realAccountNumber) {
  const value = Number(realAccountNumber.replace(/^ACC/i, ""));
  return `ACC${value + 1000}`;
}
