import { HttpClient } from './httpClient.js';
import { endpoints } from './enpoints.js';
import { validateResponseSchema } from './schemaValidator.js';
import { stepLogger } from './stepLogger.js';
import { step } from 'allure-js-commons';
import { writeCoverageFile } from './swaggerCoverageWriter.js';

class Requester {
  constructor() {
    this.httpClient = new HttpClient();
  }

  checkUrl(url, urlParam) {
    if (typeof url === 'function') {
      return url(urlParam);
    }
    return url;
  }

  async request(endpointKey, { data = null, config = {}, urlParam = null } = {}) {
    const endpoint = endpoints[endpointKey];

    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} not found`);
    }

    const { url: rawUrl, method, responseModel, templateUrl } = endpoint;
    const url = this.checkUrl(rawUrl, urlParam);
    const coveragePath = templateUrl ?? url;

    if (!method) {
      throw new Error(`Method not specified for endpoint ${endpointKey}`);
    }
    const requestData = data?.toJson ? data?.toJson() : data;
    const httpMethod = method.toLowerCase();

    return await step(`${httpMethod.toUpperCase()} ${url}`, async () => {
      await stepLogger.request(httpMethod, url, requestData);

      try {
        let response;

        if (httpMethod === 'get' || httpMethod === 'delete') {
          response = await this.httpClient[httpMethod](url, {
            params: requestData,
            ...config,
          });
        } else {
          response = await this.httpClient[httpMethod](url, requestData, config);
        }

        await stepLogger.response(response.status, responseModel?.name);

        if (responseModel) {
          validateResponseSchema(responseModel.name, response.data);
        }

        const responseData = responseModel
          ? this.#instantiateModel(responseModel, response.data)
          : response.data;

        writeCoverageFile(httpMethod, coveragePath, response.status, requestData);

        return {
          data: responseData,
          status: response.status,
          headers: response.headers,
        };
      } catch (error) {
        if (error.response) {
          await stepLogger.error(error.response.status, error.response.data);
          writeCoverageFile(httpMethod, coveragePath, error.response.status, requestData);
        }
        throw error;
      }
    });
  }

  #instantiateModel(ModelClass, data) {
    if (typeof ModelClass.fromJson === 'function') {
      return ModelClass.fromJson(data);
    }
    return new ModelClass(data);
  }
}

export const requester = new Requester();
