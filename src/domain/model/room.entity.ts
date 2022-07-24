import { DBRoom } from "../../infrastructure/repository/room-repository";
import { Hand } from "./hand.value";
import { RoomId } from "./room-id.value";
import { RpsBattle, UserHand } from "./rps-battle.value";
import { Entity } from "./shared/entity";
import { UserCollection } from "./user.collection";
import { User, UserName } from "./user.value";

export type RoomProps = {
    roomId: RoomId;
    userNameList: User[];
    numberOfWinners: number;
    isStarted?: boolean;
    rpsBattleList?: RpsBattle[];
    confirmedWinnerNameList?: User[];
    confirmedLoserNameList?: User[];
};

export type RoundResult = {
    roundWinnerNameList: UserName[];
    userHandList: UserHand[];
    // confirmedWinnerNameList: UserName[];
    // confirmedLoserNameList: UserName[];
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _userCollection: UserCollection;

    // rule
    private readonly _numberOfWinners: number;

    // room status
    private _isStarted: boolean;

    // battle
    private _rpsBattleList: RpsBattle[];
    private _confirmedWinnerCollection: UserCollection;
    private _confirmedLoserCollection: UserCollection;

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userCollection = new UserCollection({
            userList: props.userNameList,
        });
        this._numberOfWinners = props.numberOfWinners;
        this._isStarted = props.isStarted ?? false;
        this._rpsBattleList = props.rpsBattleList ?? [];
        this._confirmedWinnerCollection = new UserCollection({
            userList: props.confirmedWinnerNameList ?? [],
        });
        this._confirmedLoserCollection = new UserCollection({
            userList: props.confirmedLoserNameList ?? [],
        });
    }

    /**
     * Room ID
     */
    public roomId(): RoomId {
        return this.id;
    }

    /**
     * User Collection
     */
    public addUser(user: User): void {
        this._userCollection.addUser(user);
    }
    public removeUser(user: User): void {
        this._userCollection.removeUser(user);
    }
    public userNameList(): UserName[] {
        return this._userCollection.userNameList();
    }
    public isMaxPlayer(): boolean {
        return this._userCollection.count() === 8;
    }
    public verifyUserName(userName: UserName): boolean {
        return this._userCollection.verifyUserName(userName);
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

        const isAllUserChooseHand = battle.userHandList().length === this._userCollection.count();
        return isAllUserChooseHand;
    }

    public judgeBattle(): RoundResult {
        const battle = this.currentBattle();
        if (battle === undefined) {
            throw new Error("battle is not found");
        }

        // TODO: winner, loser を記録する
        const roundWinnerNameList: UserName[] = battle.judgeRoundWinnerList();
        return {
            roundWinnerNameList,
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
        return this._confirmedWinnerCollection.count() === this._numberOfWinners;
    }

    public winnerUserNameList(): UserName[] {
        return this._confirmedWinnerCollection.userNameList();
    }

    public toRepository(): DBRoom {
        return {
            roomId: this.id.value,
            userNameList: this._userCollection.userNameList(),
            numberOfWinners: this._numberOfWinners,
            isStarted: this._isStarted,
            rpsBattleList: this._rpsBattleList.map((battle) => battle.toObject()),
            confirmedWinnerNameList: this._confirmedWinnerCollection.userNameList(),
            confirmedLoserNameList: this._confirmedLoserCollection.userNameList(),
        };
    }
}
