import { expect } from 'chai';
import { requester } from '../utils/requester.js';

export class ValidatedRequester {
  constructor(requestSpec, endpointKey, responseSpec) {
    this.requestSpec = requestSpec;
    this.endpointKey = endpointKey;
    this.responseSpec = responseSpec;
  }

  async send(options) {
    const { data = null, stepName = null, urlParam = null } = options ?? {};
    const config = this.requestSpec?.buildConfig ? await this.requestSpec.buildConfig() : {};
    const result = await requester.request(this.endpointKey, { data, config, stepName, urlParam });

    if (this.responseSpec?.expectedStatus != null) {
      expect(result.status).to.equal(this.responseSpec.expectedStatus);
    }
    if (this.responseSpec?.validateData) {
      await this.responseSpec.validateData(result.data, result);
    }

    return result;
  }

  // Aliases to keep call-sites readable (endpoint method is defined in `endpoints.js`)
  async post(options) {
    return await this.send(options ?? {});
  }
  async get(options) {
    return await this.send(options ?? {});
  }
  async put(options) {
    return await this.send(options ?? {});
  }
  async del(options) {
    return await this.send(options ?? {});
  }
}
