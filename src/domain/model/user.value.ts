import { DBUser } from "../../infrastructure/repository/room-repository";
import { ValueObject } from "./shared/value-object";

export type UserName = string;
export type WinOrLose = `win` | `lose`;

type UserProps = {
    userName: UserName;
    winOrLose?: `win` | `lose`;
};

export class User implements ValueObject<UserProps> {
    private readonly _userName: UserName;
    private _winOrLose?: `win` | `lose`;

    constructor(props: UserProps) {
        this._userName = props.userName;
        this._winOrLose = props.winOrLose;
    }

    public userName(): UserName {
        return this._userName;
    }

    public setToWin(): void {
        this._winOrLose = `win`;
    }

    public isWin(): boolean {
        return this._winOrLose === `win`;
    }

    public setToLose(): void {
        this._winOrLose = `lose`;
    }

    public isLose(): boolean {
        return this._winOrLose === `lose`;
    }

    public isFighting(): boolean {
        return this._winOrLose === undefined;
    }

    public toRepository(): DBUser {
        return {
            userName: this._userName,
            winOrLose: this._winOrLose,
        };
    }

    isEquals(other: User): boolean {
        return this._userName === other._userName;
    }
}
