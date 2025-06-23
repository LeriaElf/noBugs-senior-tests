export default class CreateUserRequest {
    constructor(username, password, role = 'USER') {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    static generateUserData(role = 'USER') {
        const username = `user_${Date.now()}`;
        const password = `password_${Date.now()}`;

        return new CreateUserRequest(username, password, role);
    }
}