export class DeleteUserResponse {
  constructor(message) {
    this.message = message;
  }

  static fromJson(data) {
    return new DeleteUserResponse(data);
  }
}
