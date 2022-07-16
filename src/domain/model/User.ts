export type UserName = string;

export class User {
    private readonly _userName: UserName;

    constructor(userName: UserName) {
        this._userName = userName;
    }

    public userName(): UserName {
        return this._userName;
    }
}
