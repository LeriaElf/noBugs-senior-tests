export class Header {
  constructor(root) {
    this.root = root;
  }

  get userInfo() {
    return this.root.locator("//div[@class = 'user-info']");
  }

  async getUserName() {
    return await this.userInfo
      .locator("//span[@class = 'user-name']")
      .innerText();
  }

  async getUserUserName() {
    const text = await this.userInfo
      .locator("//span[@class = 'user-username']")
      .innerText();

    return text.replace("@", "");
  }

  async userInfoClick() {
    await this.userInfo.click();
    return this;
  }
}
