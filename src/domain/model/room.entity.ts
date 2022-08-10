import { DBRoom } from "../../infrastructure/repository/room-repository";
import { RoomId } from "./room-id.value";
import { RpsJudgeService } from "./rps-judge.service";
import { RpsRoundCollection } from "./rps-round.collection";
import { RpsRound } from "./rps-round.value";
import { Entity } from "./shared/entity";
import { UserHand } from "./user-hand.value";
import { UserCollection } from "./user.collection";
import { User, UserName } from "./user.value";

export type RoomProps = {
    roomId: RoomId;
    userList: User[];
    numberOfWinners?: number;
    isStarted?: boolean;
    rpsRoundList?: RpsRound[];
};

export type RoundResult = {
    roundWinnerList: UserName[];
    userHandList: UserHand[];
};

export class Room extends Entity<RoomId> {
    // room user
    private _userCollection: UserCollection;

    // rule
    private _numberOfWinners: number;

    // room status
    private _isStarted: boolean;

    // battle
    private _rpsRoundCollection: RpsRoundCollection;

    constructor(props: RoomProps) {
        super(props.roomId);

        this._userCollection = new UserCollection({
            userList: props.userList,
        });
        this._numberOfWinners = props.numberOfWinners ?? 1;
        this._isStarted = props.isStarted ?? false;
        this._rpsRoundCollection = new RpsRoundCollection({
            rpsRoundList: props.rpsRoundList ?? [],
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
        return round.chosenCount() === this._userCollection.fightingCount();
    }

    public judgeRound(): RoundResult {
        const round: RpsRound = this._rpsRoundCollection.currentRound();

        // round result
        const roundWinnerList: UserName[] = round.judgeRoundWinnerList();
        const userHandList: UserHand[] = round.userHandList();

        // update winOrLose
        RpsJudgeService.updateWinOrLose({
            userCollection: this._userCollection,
            numberOfWinners: this._numberOfWinners,
            roundWinnerList,
        });

        return {
            roundWinnerList,
            userHandList,
        };
    }

    public chosenUserNameList(): UserName[] {
        const round: RpsRound = this._rpsRoundCollection.currentRound();
        return round.chosenUserNameList();
    }

    public isCompleted(): boolean {
        return this._userCollection.winnerCount() === this._numberOfWinners;
    }

    public winnerUserNameList(): UserName[] {
        return this._userCollection.winnerUserNameList();
    }

    public toRepository(): DBRoom {
        return {
            roomId: this.id.value,
            userList: this._userCollection.toRepository(),
            numberOfWinners: this._numberOfWinners,
            isStarted: this._isStarted,
            rpsRoundList: this._rpsRoundCollection.toRepository(),
        };
    }
}
