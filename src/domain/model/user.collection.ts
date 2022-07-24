import { DBUser } from "../../infrastructure/repository/room-repository";
import { User, UserName } from "./user.value";

type UserCollectionProps = {
    userList: User[];
};

export class UserCollection {
    private readonly _userList: User[];

    constructor(props: UserCollectionProps) {
        this._userList = props.userList;
    }

    public userNameList(): UserName[] {
        return this._userList.map((user) => user.userName());
    }

    public count(): number {
        return this._userList.length;
    }

    public fightingCount(): number {
        return this._userList.filter((user) => user.isFighting()).length;
    }

    public winnerCount(): number {
        return this._userList.filter((user) => user.isWin()).length;
    }

    public winnerUserNameList(): UserName[] {
        return this._userList.filter((user) => user.isWin()).map((user) => user.userName());
    }

    public addUser(user: User): void {
        const userNameList = this.userNameList();
        if (userNameList.includes(user.userName())) {
            return;
        }
        this._userList.push(user);
    }

    public removeUser(user: User): void {
        const removeIndex = this.userNameList().indexOf(user.userName());
        this._userList.splice(removeIndex, 1);
    }

    public updateToWin({ roundWinnerNameList }: { roundWinnerNameList: UserName[] }): void {
        const fightingUserList: User[] = this._userList.filter((user) => user.isFighting());
        fightingUserList.forEach((user) => {
            const isWinner = roundWinnerNameList.includes(user.userName());
            if (isWinner) user.setToWin();
        });
    }

    public updateToLose({ roundWinnerNameList }: { roundWinnerNameList: UserName[] }): void {
        const fightingUserList: User[] = this._userList.filter((user) => user.isFighting());
        fightingUserList.forEach((user) => {
            const isWinner = roundWinnerNameList.includes(user.userName());
            if (!isWinner) user.setToLose();
        });
    }

    public isMaxPlayer(): boolean {
        return this._userList.length === 8;
    }

    public verifyUserName(userName: UserName): boolean {
        const userNameList = this.userNameList();
        return !userNameList.includes(userName);
    }

    public toRepository(): DBUser[] {
        return this._userList.map((user) => user.toRepository());
    }
}
