"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpsBattleJudgeService = void 0;
const hand_value_1 = require("./hand.value");
class RpsBattleJudgeService {
    static judge(userHandList) {
        const winnerHand = this.winnerHand(userHandList);
        const winnerNameList = userHandList
            .filter((userHand) => userHand.hand === winnerHand)
            .map((userHand) => userHand.userName);
        return winnerNameList;
    }
    static winnerHand(userHandList) {
        const uniqueHandList = [...new Set(userHandList.map((userHand) => userHand.hand))];
        const handCount = uniqueHandList.length;
        if (handCount === 1 || handCount === 3) {
            return undefined;
        }
        const hasRock = (l) => l.includes(hand_value_1.Hand.ROCK);
        const hasPaper = (l) => l.includes(hand_value_1.Hand.PAPER);
        const hasScissors = (l) => l.includes(hand_value_1.Hand.SCISSORS);
        if (hasRock(uniqueHandList) && hasPaper(uniqueHandList)) {
            return hand_value_1.Hand.PAPER;
        }
        if (hasRock(uniqueHandList) && hasScissors(uniqueHandList)) {
            return hand_value_1.Hand.ROCK;
        }
        if (hasPaper(uniqueHandList) && hasScissors(uniqueHandList)) {
            return hand_value_1.Hand.SCISSORS;
        }
    }
}
exports.RpsBattleJudgeService = RpsBattleJudgeService;
//# sourceMappingURL=rps-battle-judge.service.js.map