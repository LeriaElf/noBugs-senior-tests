export class Condition {
  constructor(sql, params) {
    this.sql = sql;
    this.params = params;
  }

  static equalTo(column, value) {
    return new Condition(`${column} = $1`, [value]);
  }

  static and(conditions) {
    const parts = [];
    const params = [];
    let idx = 1;
    for (const c of conditions) {
      const reindexed = c.sql.replace(/\$\d+/g, () => `$${idx++}`);
      parts.push(reindexed);
      params.push(...c.params);
    }
    return new Condition(parts.join(' AND '), params);
  }
}
