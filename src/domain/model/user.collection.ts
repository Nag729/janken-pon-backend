import { DBUser } from "../../infrastructure/repository/room-repository";
import { User, UserName } from "./user.value";

type UserCollectionProps = {
    userList: User[];
};

const MAX_USER_COUNT = 8;

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

    public winnerNameList(): UserName[] {
        return this._userList.filter((user) => user.isWin()).map((user) => user.userName());
    }

    public loserNameList(): UserName[] {
        return this._userList.filter((user) => user.isLose()).map((user) => user.userName());
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

    public updateToWin({ roundWinnerList }: { roundWinnerList: UserName[] }): void {
        const fightingUserList: User[] = this._userList.filter((user) => user.isFighting());
        fightingUserList.forEach((user) => {
            const isWinner = roundWinnerList.includes(user.userName());
            if (isWinner) user.setToWin();
        });
    }

    public updateToLose({ roundWinnerList }: { roundWinnerList: UserName[] }): void {
        const fightingUserList: User[] = this._userList.filter((user) => user.isFighting());
        fightingUserList.forEach((user) => {
            const isWinner = roundWinnerList.includes(user.userName());
            if (!isWinner) user.setToLose();
        });
    }

    public isMaxPlayer(): boolean {
        return this._userList.length === MAX_USER_COUNT;
    }

    public verifyUserName(userName: UserName): boolean {
        const userNameList = this.userNameList();
        return !userNameList.includes(userName);
    }

    public toRepository(): DBUser[] {
        return this._userList.map((user) => user.toRepository());
    }
}
