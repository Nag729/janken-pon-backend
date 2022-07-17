import { Hand } from "./hand.value";
import { RoomId } from "./room-id.value";
import { RpsBattle } from "./rps-battle.value";
import { Entity } from "./shared/entity";
import { User, UserName } from "./user.value";

export type RoomProps = {
    roomId: RoomId;
    userNameList?: UserName[];
    isStarted?: boolean;
    isEnded?: boolean;
    rpsBattleList?: RpsBattle[];
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _userList: User[];

    // status
    private _isStarted: boolean;
    private _isEnded: boolean;

    // battle
    private _rpsBattleList: RpsBattle[];

    // TODO: ここに loser, winner 情報を持たせるとよさそう

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userList = props.userNameList?.map((userName) => new User({ userName })) ?? [];
        this._isStarted = props.isStarted ?? false;
        this._isEnded = props.isEnded ?? false;
        this._rpsBattleList = props.rpsBattleList ?? [];
    }

    /**
     * Room ID
     */
    public roomId(): RoomId {
        return this.id;
    }

    /**
     * User
     */
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

    public userNameList(): UserName[] {
        return this._userList.map((user) => user.userName());
    }

    public verifyUserName(userName: UserName): boolean {
        const userNameList = this.userNameList();
        return !userNameList.includes(userName);
    }

    /**
     * Room Status
     */
    public isStarted(): boolean {
        return this._isStarted;
    }

    public startRps(): void {
        this._isStarted = true;
        this.startNextRound();
    }

    public isEnded(): boolean {
        return this._isEnded;
    }

    public endRps(): void {
        this._isEnded = true;
    }

    /**
     * RPS Battle
     */
    public startNextRound(): void {
        const nextRound: number = this._rpsBattleList.length + 1;
        const nextBattle = new RpsBattle({
            round: nextRound,
            userHandList: [],
        });
        this._rpsBattleList.push(nextBattle);
    }

    private currentBattle(): RpsBattle | undefined {
        return this._rpsBattleList[this._rpsBattleList.length - 1];
    }

    public chooseHand(userName: UserName, hand: Hand): void {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return;
        }
        battle.addUserHand(userName, hand);
    }

    public isReadyToJudge(): boolean {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return false;
        }
        return battle.userHandList().length === this._userList.length;
    }

    public judgeBattle(): UserName[] {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return [];
        }

        const isReadyToJudge = battle.userHandList().length === this._userList.length;
        if (!isReadyToJudge) {
            return [];
        }

        // TODO: 勝者が 2 人以上なら次のラウンドへ...
        const winnerList: UserName[] = battle.judge();
        return winnerList;
    }

    public chosenUserNameList(): UserName[] {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return [];
        }
        return battle.userHandList().map((userHand) => userHand.userName);
    }

    public toRepository() {
        return {
            roomId: this.id.value,
            userNameList: this._userList.map((user) => user.userName()),
            isStarted: this._isStarted,
            isEnded: this._isEnded,
            rpsBattleList: this._rpsBattleList.map((battle) => battle.toObject()),
        };
    }
}
