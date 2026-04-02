import { fetchOne } from './dbClient.js';

export class DBRequest {
  #table = null;
  #where = null;

  static builder() {
    return new DBRequest();
  }

  table(name) {
    this.#table = name;
    return this;
  }

  where(condition) {
    this.#where = condition;
    return this;
  }

  async extractAs(DaoClass) {
    const row = await this.#execute();
    if (!row) {
      throw new Error(
        `DB row not found in "${this.#table}" with condition: ${this.#where?.sql}, params: ${this.#where?.params}`,
      );
    }
    return new DaoClass(row);
  }

  async extractOptionalAs(DaoClass) {
    const row = await this.#execute();
    return row ? new DaoClass(row) : null;
  }

  async #execute() {
    if (!this.#table) throw new Error('Table is required');

    let sql = `SELECT * FROM ${this.#table}`;
    let params = [];

    if (this.#where) {
      sql += ` WHERE ${this.#where.sql}`;
      params = this.#where.params;
    }

    sql += ' LIMIT 1';
    return await fetchOne(sql, params);
  }
}
