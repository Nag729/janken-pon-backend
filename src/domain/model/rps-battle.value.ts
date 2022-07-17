import { Hand } from "./hand.value";
import { RpsBattleJudgeService } from "./rps-battle-judge.service";
import { ValueObject } from "./shared/value-object";
import { UserName } from "./user.value";
const equal = require("deep-equal");

export type UserHand = {
    userName: UserName;
    hand: Hand;
};

type RpsBattleProps = {
    round: number;
    userHandList: UserHand[];
};

export class RpsBattle implements ValueObject<RpsBattleProps> {
    private readonly _round: number;
    private readonly _userHandList: UserHand[];

    constructor(props: RpsBattleProps) {
        this._round = props.round;
        this._userHandList = props.userHandList;
    }

    public addUserHand(userName: UserName, hand: Hand): void {
        const isAlreadyChoosed = this._userHandList.some((userHand) => userHand.userName === userName);
        if (isAlreadyChoosed) {
            throw new Error(`${userName} is already choosed on this round.`);
        }
        this._userHandList.push({ userName, hand });
    }

    public userHandList(): UserHand[] {
        return this._userHandList;
    }

    public judge(): UserName[] {
        return RpsBattleJudgeService.judge(this._userHandList);
    }

    public toObject() {
        return {
            round: this._round,
            userHandList: this._userHandList,
        };
    }

    isEquals(other: RpsBattle): boolean {
        return this._round === other._round && equal(this._userHandList, other._userHandList);
    }
}
