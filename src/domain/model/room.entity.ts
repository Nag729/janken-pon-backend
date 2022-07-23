import { DBRoom } from "../../infrastructure/repository/room-repository";
import { Hand } from "./hand.value";
import { RoomId } from "./room-id.value";
import { RpsBattle, UserHand } from "./rps-battle.value";
import { Entity } from "./shared/entity";
import { User, UserName } from "./user.value";

export type RoomProps = {
    roomId: RoomId;
    userNameList: UserName[];
    numberOfWinners: number;
    isStarted?: boolean;
    rpsBattleList?: RpsBattle[];
    winnerNameList?: UserName[];
    loserNameList?: UserName[];
};

export type RoundResult = {
    roundWinnerList: UserName[];
    userHandList: UserHand[];
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _userList: User[];

    // rule
    private readonly _numberOfWinners: number;

    // room status
    private _isStarted: boolean;

    // battle
    private _rpsBattleList: RpsBattle[];
    private _winnerNameList: string[];
    private _loserNameList: string[];

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userList = props.userNameList?.map((userName) => new User({ userName }));
        this._numberOfWinners = props.numberOfWinners;
        this._isStarted = props.isStarted ?? false;
        this._rpsBattleList = props.rpsBattleList ?? [];
        this._winnerNameList = props.winnerNameList ?? [];
        this._loserNameList = props.loserNameList ?? [];
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

    public isMaxPlayer(): boolean {
        return this._userList.length === 8;
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

    public isAllUserChooseHand(): boolean {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return false;
        }

        const isAllUserChooseHand = battle.userHandList().length === this._userList.length;
        return isAllUserChooseHand;
    }

    public judgeBattle(): RoundResult {
        const battle = this.currentBattle();
        if (battle === undefined) {
            throw new Error("battle is not found");
        }

        // TODO: winner, loser を記録する
        return {
            roundWinnerList: battle.judge(),
            userHandList: battle.userHandList(),
        };
    }

    public chosenUserNameList(): UserName[] {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return [];
        }
        return battle.userHandList().map((userHand) => userHand.userName);
    }

    public isCompleted(): boolean {
        return this._winnerNameList.length === this._numberOfWinners;
    }

    public winnerUserNameList(): UserName[] {
        return this._winnerNameList;
    }

    public toRepository(): DBRoom {
        return {
            roomId: this.id.value,
            userNameList: this._userList.map((user) => user.userName()),
            numberOfWinners: this._numberOfWinners,
            isStarted: this._isStarted,
            rpsBattleList: this._rpsBattleList.map((battle) => battle.toObject()),
            winnerNameList: this._winnerNameList,
            loserNameList: this._loserNameList,
        };
    }
}
