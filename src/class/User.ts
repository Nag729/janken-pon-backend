export class User {
  private readonly _userName: string;

  constructor(userName: string) {
    this._userName = userName;
  }

  public userName(): string {
    return this._userName;
  }
}
