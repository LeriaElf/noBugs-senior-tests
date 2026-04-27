export class AccountDao {
  constructor({ id, account_number, balance, customer_id }) {
    this.id = id;
    this.accountNumber = account_number;
    this.balance = Number(balance);
    this.customerId = customer_id;
  }
}
