import { requester } from './requester.js';

class ErrorHandlingRequester {
  async requestExpectingError(endpointKey, { data = null, config = {}, expectedError }) {
    try {
      await requester.request(endpointKey, { data, config });
      throw new Error(
        `Expected error with status "${expectedError.statusCode}", but request succeeded with 2xx`,
      );
    } catch (error) {
      if (error.message.includes('but request succeeded')) {
        throw error;
      }

      const actualStatus = error.response?.status;
      const responseData = error.response?.data;

      if (actualStatus !== expectedError.statusCode) {
        throw new Error(
          `Expected status "${expectedError.statusCode}", but got "${actualStatus}"`,
          { cause: error },
        );
      }

      const actualValue =
        typeof responseData === 'string' ? responseData : responseData?.[expectedError.errorKey];

      const actualMessagesArray = Array.isArray(actualValue) ? actualValue : [actualValue];

      const expectedSorted = [...expectedError.errorMessages].sort();
      const actualSorted = [...actualMessagesArray].sort();

      if (
        expectedSorted.length !== actualSorted.length ||
        !expectedSorted.every((msg, i) => msg === actualSorted[i])
      ) {
        throw new Error(
          `Expected messages ${JSON.stringify(expectedError.errorMessages)}, but got ${JSON.stringify(actualMessagesArray)}`,
          { cause: error },
        );
      }

      return;
    }
  }
}

export const errorHandlingRequester = new ErrorHandlingRequester();
