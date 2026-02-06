export class ExpectedError {
  constructor({ statusCode, errorKey, errorMessages }) {
    this.statusCode = statusCode;
    this.errorKey = errorKey;
    this.errorMessages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
  }
}
