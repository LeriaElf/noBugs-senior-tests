export default class ExpectedError {
    constructor({ statusCode, errorKey, errorMessage}) {
        this.statusCode = statusCode;
        this.errorKey = errorKey;
        this.errorMessage = errorMessage;
    }
}