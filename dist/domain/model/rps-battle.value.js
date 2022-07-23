"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpsBattle = void 0;
const rps_battle_judge_service_1 = require("./rps-battle-judge.service");
const equal = require("deep-equal");
class RpsBattle {
    constructor(props) {
        this._round = props.round;
        this._userHandList = props.userHandList;
    }
    addUserHand(userName, hand) {
        const isAlreadyChoosed = this._userHandList.some((userHand) => userHand.userName === userName);
        if (isAlreadyChoosed) {
            throw new Error(`${userName} is already choosed on this round.`);
        }
        this._userHandList.push({ userName, hand });
    }
    userHandList() {
        return this._userHandList;
    }
    judge() {
        return rps_battle_judge_service_1.RpsBattleJudgeService.judge(this._userHandList);
    }
    toObject() {
        return {
            round: this._round,
            userHandList: this._userHandList,
        };
    }
    isEquals(other) {
        return this._round === other._round && equal(this._userHandList, other._userHandList);
    }
}
exports.RpsBattle = RpsBattle;
//# sourceMappingURL=rps-battle.value.js.map