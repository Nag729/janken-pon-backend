import { DBRpsRound } from "../../infrastructure/repository/room-repository";
import { RpsJudgeService } from "./rps-judge.service";
import { ValueObject } from "./shared/value-object";
import { UserHandCollection } from "./user-hand.collection";
import { UserHand } from "./user-hand.value";
import { User, UserName } from "./user.value";
const equal = require("deep-equal");

type RpsRoundProps = {
    round: number;
    userHandList: UserHand[];
};

export class RpsRound implements ValueObject<RpsRoundProps> {
    private readonly _round: number;
    private readonly _userHandCollection: UserHandCollection;

    constructor(props: RpsRoundProps) {
        this._round = props.round;
        this._userHandCollection = new UserHandCollection({
            userHandList: props.userHandList,
        });
    }

    public addUserHand(userHand: UserHand): void {
        this._userHandCollection.addUserHand(userHand);
    }

    public chosenCount(): number {
        return this._userHandCollection.count();
    }

    public judgeRoundWinnerList(): User[] {
        return RpsJudgeService.judgeRoundWinnerList(this._userHandCollection);
    }

    public userHandList(): UserHand[] {
        return this._userHandCollection.userHandList();
    }

    public chosenUserList(): User[] {
        return this._userHandCollection.userHandList().map((userHand) => new User({ userName: userHand.userName() }));
    }

    public toRepository(): DBRpsRound {
        return {
            round: this._round,
            userHandList: this._userHandCollection.userHandList().map((userHand) => ({
                userName: userHand.userName(),
                hand: userHand.hand(),
            })),
        };
    }

    isEquals(other: RpsRound): boolean {
        return this._round === other._round && equal(this._userHandCollection, other._userHandCollection);
    }
}
