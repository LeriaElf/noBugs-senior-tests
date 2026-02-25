export class UserBadge {
  constructor(root) {
    this.root = root;
  }

  async getRole() {
    const root = this.root.getByText("USER", { exact: true });

    if (await root.count()) return await root.innerText().trim();
    const full = ((await this.root.innerText()) || "").trim();

    const match = full.match(/\b(USER|ADMIN)\b$/);

    return (match?.[1] || "").trim();
  }

  async getUsername() {
    const full = ((await this.root.innerText()) || "").trim();
    const roleText = await this.getRole();

    return roleText ? full.replace(roleText, "").trim() : full;
  }
}
