import { HandType } from "./hand";
import { RoomId } from "./room-id.value";
import { Entity } from "./shared/entity";
import { User, UserName } from "./user";

export type RoomProps = {
    roomId: RoomId;
    masterName: UserName;
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _masterName: UserName;
    private readonly _userList: User[];

    // status
    private readonly _isStarted: boolean = false;
    private readonly _isEnded: boolean = false;

    // winner
    private readonly _winner?: UserName = undefined;
    private readonly _winnerHand?: HandType = undefined;

    constructor(props: RoomProps) {
        super(props.roomId);

        this._masterName = props.masterName;
        this._userList = [];
    }

    addUser(user: User): void {
        this._userList.push(user);
    }

    public roomId(): RoomId {
        return this.id;
    }

    public userNameList(): UserName[] {
        return this._userList.map((user) => user.userName());
    }

    public toRepository() {
        return {
            roomId: this.id,
            masterName: this._masterName,
            userNameList: this._userList.map((user) => user.userName()),
            isStarted: this._isStarted,
            isEnded: this._isEnded,
            winner: this._winner,
            winnerHand: this._winnerHand,
        };
    }
}
