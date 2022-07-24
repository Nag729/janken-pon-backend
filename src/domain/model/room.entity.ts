import { DBRoom } from "../../infrastructure/repository/room-repository";
import { RoomId } from "./room-id.value";
import { RpsRoundCollection } from "./rps-round.collection";
import { RpsRound } from "./rps-round.value";
import { Entity } from "./shared/entity";
import { UserHand } from "./user-hand.value";
import { UserCollection } from "./user.collection";
import { User, UserName } from "./user.value";

export type RoomProps = {
    roomId: RoomId;
    userNameList: User[];
    numberOfWinners: number;
    isStarted?: boolean;
    rpsRoundList?: RpsRound[];
    confirmedWinnerNameList?: User[];
    confirmedLoserNameList?: User[];
};

export type RoundResult = {
    roundWinnerList: User[];
    userHandList: UserHand[];
    // confirmedWinnerList: User[];
    // confirmedLoserList: User[];
};

export class Room extends Entity<RoomId> {
    // room user
    private readonly _userCollection: UserCollection;

    // rule
    private readonly _numberOfWinners: number;

    // room status
    private _isStarted: boolean;

    // battle
    private _rpsRoundCollection: RpsRoundCollection;
    private _confirmedWinnerCollection: UserCollection;
    private _confirmedLoserCollection: UserCollection;

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userCollection = new UserCollection({
            userList: props.userNameList,
        });
        this._numberOfWinners = props.numberOfWinners;
        this._isStarted = props.isStarted ?? false;
        this._rpsRoundCollection = new RpsRoundCollection({
            rpsRoundList: props.rpsRoundList ?? [],
        });
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
        const MAX_PLAYER_COUNT = 8;
        return this._userCollection.count() === MAX_PLAYER_COUNT;
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
     * RPS Round
     */
    public startNextRound(): void {
        this._rpsRoundCollection.startNextRound();
    }

    public chooseHand(userHand: UserHand): void {
        const round: RpsRound = this._rpsRoundCollection.currentRound();
        round.addUserHand(userHand);
    }

    public isAllUserChooseHand(): boolean {
        const round: RpsRound = this._rpsRoundCollection.currentRound();
        const chosenCount: number = round.chosenCount();
        const userCount = this._userCollection.count();
        return chosenCount === userCount;
    }

    public judgeRound(): RoundResult {
        const round: RpsRound = this._rpsRoundCollection.currentRound();

        // TODO: winner, loser を算出する
        const roundWinnerList = round.judgeRoundWinnerList();
        const userHandList = round.userHandList();

        return {
            roundWinnerList,
            userHandList,
        };
    }

    public chosenUserNameList(): UserName[] {
        const round: RpsRound = this._rpsRoundCollection.currentRound();
        const chosenUserList: User[] = round.chosenUserList();
        return chosenUserList.map((user) => user.userName());
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
            rpsRoundList: this._rpsRoundCollection.toRepository(),
            confirmedWinnerNameList: this._confirmedWinnerCollection.userNameList(),
            confirmedLoserNameList: this._confirmedLoserCollection.userNameList(),
        };
    }
}
