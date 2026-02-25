export const AMOUNT_RE = /\$\s*([\d]+(?:\.[\d]+)?)/;
export const ACCOUNT_RE = /(ACC[\w-]+)/;

export function parseAlertAmount(alertMessage) {
  return Number(alertMessage.match(AMOUNT_RE)?.[1]);
}

export function parseAlertAccount(alertMessage) {
  return alertMessage.match(ACCOUNT_RE)?.[1];
}
