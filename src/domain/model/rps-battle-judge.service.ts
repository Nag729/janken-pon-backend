import { Hand } from "./hand.value";
import { UserHand } from "./rps-battle.value";
import { UserName } from "./user.value";

export class RpsBattleJudgeService {
    public static judge(userHandList: UserHand[]): UserName[] {
        const winnerHand: Hand | undefined = this.winnerHand(userHandList);

        const winnerNameList: UserName[] = userHandList
            .filter((userHand) => userHand.hand === winnerHand)
            .map((userHand) => userHand.userName);
        return winnerNameList;
    }

    private static winnerHand(userHandList: UserHand[]): Hand | undefined {
        const uniqueHandList: Hand[] = [...new Set(userHandList.map((userHand) => userHand.hand))];

        const handCount: number = uniqueHandList.length;
        if (handCount === 1 || handCount === 3) {
            return undefined;
        }

        const hasRock = (l: Hand[]): boolean => l.includes(Hand.ROCK);
        const hasPaper = (l: Hand[]): boolean => l.includes(Hand.PAPER);
        const hasScissors = (l: Hand[]): boolean => l.includes(Hand.SCISSORS);

        if (hasRock(uniqueHandList) && hasPaper(uniqueHandList)) {
            return Hand.PAPER;
        }
        if (hasRock(uniqueHandList) && hasScissors(uniqueHandList)) {
            return Hand.ROCK;
        }
        if (hasPaper(uniqueHandList) && hasScissors(uniqueHandList)) {
            return Hand.SCISSORS;
        }
    }
}
