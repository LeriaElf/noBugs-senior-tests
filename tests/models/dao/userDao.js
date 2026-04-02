export class UserDao {
  constructor({ id, username, password, name = null, role }) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.name = name;
    this.role = role;
  }
}
