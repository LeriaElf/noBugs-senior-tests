export default class LoginUserRequest {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    static fromJson(json) {
        return new LoginUserRequest(json.username, json.password);
    }
}