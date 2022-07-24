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

    public isMaxPlayer(): boolean {
        return this._userList.length === 8;
    }

    public verifyUserName(userName: UserName): boolean {
        const userNameList = this.userNameList();
        return !userNameList.includes(userName);
    }
}
