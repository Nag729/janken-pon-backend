import { Hand } from "./hand.value";
import { UserHandCollection } from "./user-hand.collection";
import { User, UserName } from "./user.value";

export class RpsJudgeService {
    public static judgeRoundWinnerList(userHandCollection: UserHandCollection): User[] {
        const winnerHand: Hand | undefined = this.winnerHand(userHandCollection);
        return userHandCollection
            .filterByHand(winnerHand)
            .map((userHand) => new User({ userName: userHand.userName() }));
    }

    private static winnerHand(userHandCollection: UserHandCollection): Hand | undefined {
        const uniqueHandList: Hand[] = userHandCollection.uniqueHandList();

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
