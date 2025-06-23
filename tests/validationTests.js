import { expect } from "chai";
import axios from "axios";

const baseURL = 'http://localhost:4111/api/v1';

const invalidData = [
  {
    username: '',
    password: 'Password123!',
    role: 'USER',
    errorKey: 'username',
    errorMessage: 'Username must be between 3 and 15 characters'
  },
  {
    username: 'ab',
    password: 'Password123!',
    role: 'USER',
    errorKey: 'username',
    errorMessage: 'Username must be between 3 and 15 characters'
  },
  {
    username: 'abc$',
    password: 'Password123!',
    role: 'USER',
    errorKey: 'username',
    errorMessage: 'Username must contain only letters, digits, dashes, underscores, and dots'
  },
  {
    username: 'abc%',
    password: 'Password123!',
    role: 'USER',
    errorKey: 'username',
    errorMessage: 'Username must contain only letters, digits, dashes, underscores, and dots'
  }
]

describe('API Validation Tests', function () {
  invalidData.forEach(({username, password, role, errorKey, errorMessage}) => {
    it(`admin sould not be able to create a user with invalid username: ${username}`, async function () {
      const requestBody = {
        username,
        password,
        role
      };
      
      try {
      await axios.post(
        `${baseURL}/admin/users`, 
        requestBody,
        {
          headers: { Authorization: 'Basic YWRtaW46YWRtaW4=' }
        }
      );
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data[errorKey]).to.equal(errorMessage);
      }
    });
  });
});