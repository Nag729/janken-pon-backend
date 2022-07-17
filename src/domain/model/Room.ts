import { HandType } from "./hand";
import { RoomId } from "./room-id.value";
import { Entity } from "./shared/entity";
import { User, UserName } from "./user";

export type RoomProps = {
    roomId: RoomId;
    userNameList?: UserName[];
    isStarted?: boolean;
    isEnded?: boolean;
    winner?: UserName;
    winnerHand?: HandType;
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _userList: User[];

    // status
    private readonly _isStarted: boolean;
    private readonly _isEnded: boolean;

    // winner
    private readonly _winner?: UserName;
    private readonly _winnerHand?: HandType;

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userList = props.userNameList?.map((userName) => new User(userName)) ?? [];
        this._isStarted = props.isStarted ?? false;
        this._isEnded = props.isEnded ?? false;
        this._winner = props.winner;
        this._winnerHand = props.winnerHand;
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
            roomId: this.id.value,
            userNameList: this._userList.map((user) => user.userName()),
            isStarted: this._isStarted,
            isEnded: this._isEnded,
            winner: this._winner,
            winnerHand: this._winnerHand,
        };
    }
}
