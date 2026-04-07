import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  get url() {
    return '/';
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    const loginResponsePromise = this.page.waitForResponse(
      response =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/v1/auth/login'),
    );

    await this.button.click();

    const loginResponse = await loginResponsePromise;

    if (!loginResponse.ok()) {
      const responseText = await loginResponse.text();
      throw new Error(
        `UI login failed with status ${loginResponse.status()}: ${responseText}`,
      );
    }

    return this;
  }
}
