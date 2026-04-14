import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto(this.url);

    return this;
  }

  get usernameInput() {
    return this.page.getByPlaceholder('Username');
  }

  get passwordInput() {
    return this.page.getByPlaceholder('Password');
  }

  get button() {
    return this.page.getByRole('button');
  }

  get homeButton() {
    return this.page.getByText('🏠 Home', { exact: true });
  }

  getPage(PageClass) {
    return new PageClass(this.page);
  }

  async checkAlertAndAccept(bankAlert, trigger) {
    const dialogPromise = new Promise(resolve => {
      this.page.once('dialog', async dialog => {
        expect(dialog.message()).toContain(bankAlert.message);
        const text = dialog.message();
        await dialog.accept();
        resolve(text);
      });
    });

    await trigger();
    return dialogPromise;
  }

  async checkAlertAndExtractAndAccept(bankAlert, regex, trigger) {
    const text = await this.checkAlertAndAccept(bankAlert, trigger);
    const match = text.match(regex);

    expect(match, `Alert was: "${text}"`).toBeTruthy();

    return match[1];
  }

  async homeButtonClick() {
    await this.homeButton.click();
    return this;
  }
}
