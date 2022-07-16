import { User, UserName } from "./User";

export type RoomId = string;

export type RoomProps = {
    roomId: RoomId;
    masterName: UserName;
};

export class Room {
    private readonly _roomId: RoomId;
    private readonly _masterName: UserName;
    private readonly _userList: User[];

    constructor(props: RoomProps) {
        this._roomId = props.roomId;
        this._masterName = props.masterName;
        this._userList = [];
    }

    addUser(user: User): void {
        this._userList.push(user);
    }

    public roomId(): RoomId {
        return this._roomId;
    }

    public userNameList(): UserName[] {
        return this._userList.map((user) => user.userName());
    }
}
