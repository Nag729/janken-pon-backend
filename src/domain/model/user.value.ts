import { ValueObject } from "./shared/value-object";

export type UserName = string;
type UserProps = {
    userName: UserName;
};

export class User implements ValueObject<UserProps> {
    private readonly _userName: UserName;

    constructor(props: UserProps) {
        this._userName = props.userName;
    }

    public userName(): UserName {
        return this._userName;
    }

    isEquals(other: User): boolean {
        return this._userName === other._userName;
    }
}
