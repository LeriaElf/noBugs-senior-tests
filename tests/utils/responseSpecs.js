import { expect } from 'chai';
import { HTTP_STATUS } from './httpStatus.js';

export const ResponseSpecs = {
  status(expectedStatus) {
    return {
      expectedStatus,
      validateData() {},
    };
  },

  entityWasCreated() {
    return this.status(HTTP_STATUS.CREATED);
  },

  ok() {
    return this.status(HTTP_STATUS.OK);
  },

  okArrayBy(fieldName) {
    return {
      expectedStatus: HTTP_STATUS.OK,
      validateData(data) {
        expect(data[fieldName]).to.be.an('array');
      },
    };
  },

  okWithField(fieldName) {
    return {
      expectedStatus: HTTP_STATUS.OK,
      validateData(data) {
        expect(data[fieldName]).to.exist;
      },
    };
  },
};
