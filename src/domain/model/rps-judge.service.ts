import { Hand } from "./hand.value";
import { UserHandCollection } from "./user-hand.collection";
import { UserCollection } from "./user.collection";
import { User, UserName } from "./user.value";

export class RpsJudgeService {
    /**
     * Judge for Round Win or Lose
     */
    public static judgeRoundWinnerList(userHandCollection: UserHandCollection): UserName[] {
        const winnerHand: Hand | undefined = this.winnerHand(userHandCollection);
        return userHandCollection.filterByHand(winnerHand).map((userHand) => userHand.userName());
    }

    private static winnerHand(userHandCollection: UserHandCollection): Hand | undefined {
        const uniqueHandList: Hand[] = userHandCollection.uniqueHandList();

        const handCount: number = uniqueHandList.length;
        if (handCount !== 2) return undefined;

        const hasRock = (l: Hand[]): boolean => l.includes(Hand.ROCK);
        const hasPaper = (l: Hand[]): boolean => l.includes(Hand.PAPER);
        const hasScissors = (l: Hand[]): boolean => l.includes(Hand.SCISSORS);

        if (hasRock(uniqueHandList) && hasPaper(uniqueHandList)) return Hand.PAPER;
        if (hasRock(uniqueHandList) && hasScissors(uniqueHandList)) return Hand.ROCK;
        if (hasPaper(uniqueHandList) && hasScissors(uniqueHandList)) return Hand.SCISSORS;
    }

    /**
     * Update Win or Lose
     */
    public static updateWinOrLose({
        userCollection,
        numberOfWinners,
        roundWinnerList,
    }: {
        userCollection: UserCollection;
        numberOfWinners: number;
        roundWinnerList: UserName[];
    }): void {
        const alreadyWinnerCount: number = userCollection.winnerCount();
        const roundWinnerCount: number = roundWinnerList.length;

        const updateToWin: boolean = alreadyWinnerCount + roundWinnerCount <= numberOfWinners;
        if (updateToWin) {
            userCollection.updateToWin({ roundWinnerList });
        } else {
            userCollection.updateToLose({ roundWinnerList });
        }
    }
}
