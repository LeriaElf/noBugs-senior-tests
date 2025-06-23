import axios from "axios";
import { expect } from "chai";

const baseURL = 'http://localhost:4111/api/v1';

describe('API Test', function () {
    this.timeout(10000); 
    it('user should be able to generate a token', async function () {
        const generateTokenResponse = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin'
        });
        expect(generateTokenResponse.status).to.equal(200);
        expect(generateTokenResponse.headers['authorization']).to.equal('Basic YWRtaW46YWRtaW4=');

        console.log(generateTokenResponse.data);
    });

    it('admin should be able to create a new user', async function () {
        const createUserResponse = await axios.post(
            `${baseURL}/admin/users`, 
            {
            "username": 'newuser11',
            "password": "Password123!",
            "role": "USER"
        },
            {
                headers: { Authorization: 'Basic YWRtaW46YWRtaW4=' }
            }
        );

        expect(createUserResponse.status).to.equal(201);

        console.log(createUserResponse.data);
    });

    it('user should be able to create an account', async function(){
        const createUserResponse = await axios.post(
            `${baseURL}/admin/users`, 
            {
            "username": 'newuser323',
            "password": "Password123!",
            "role": "USER"
        },
            {
                headers: { Authorization: 'Basic YWRtaW46YWRtaW4=' }
            }
        );

        const getTokenResponse = await axios.post(`${baseURL}/auth/login`, {
              "username": 'newuser323',
              "password": "Password123!"
        });

        const userAuthToken = getTokenResponse.headers['authorization'];

        const createAccountResponse = await axios.post(`${baseURL}/accounts`, 
            {}
            , {
                headers: { Authorization: userAuthToken }
            }
        );

        expect(createAccountResponse.status).to.equal(201);

        const getAccountResponse = await axios.get(`${baseURL}/customer/accounts`, {
            headers: { Authorization: userAuthToken }
        });

        expect(getAccountResponse.status).to.equal(200);

        const foundAccount = getAccountResponse.data.find(account => account.id === createAccountResponse.data.id);
        expect(foundAccount).to.not.be.undefined;
        expect(foundAccount.id).to.equal(createAccountResponse.data.id);
    })
});