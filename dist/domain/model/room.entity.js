"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const rps_battle_value_1 = require("./rps-battle.value");
const entity_1 = require("./shared/entity");
const user_value_1 = require("./user.value");
class Room extends entity_1.Entity {
    constructor(props) {
        super(props.roomId);
        this._userList = props.userNameList?.map((userName) => new user_value_1.User({ userName }));
        this._numberOfWinners = props.numberOfWinners;
        this._winnerNameList = props.winnerNameList ?? [];
        this._loserNameList = props.loserNameList ?? [];
        this._isStarted = props.isStarted ?? false;
        this._isEnded = props.isEnded ?? false;
        this._rpsBattleList = props.rpsBattleList ?? [];
    }
    /**
     * Room ID
     */
    roomId() {
        return this.id;
    }
    /**
     * User
     */
    addUser(user) {
        const userNameList = this.userNameList();
        if (userNameList.includes(user.userName())) {
            return;
        }
        this._userList.push(user);
    }
    removeUser(user) {
        const removeIndex = this.userNameList().indexOf(user.userName());
        this._userList.splice(removeIndex, 1);
    }
    userNameList() {
        return this._userList.map((user) => user.userName());
    }
    verifyUserName(userName) {
        const userNameList = this.userNameList();
        return !userNameList.includes(userName);
    }
    /**
     * Room Status
     */
    isStarted() {
        return this._isStarted;
    }
    startRps() {
        this._isStarted = true;
        this.startNextRound();
    }
    isEnded() {
        return this._isEnded;
    }
    endRps() {
        this._isEnded = true;
    }
    /**
     * RPS Battle
     */
    startNextRound() {
        const nextRound = this._rpsBattleList.length + 1;
        const nextBattle = new rps_battle_value_1.RpsBattle({
            round: nextRound,
            userHandList: [],
        });
        this._rpsBattleList.push(nextBattle);
    }
    currentBattle() {
        return this._rpsBattleList[this._rpsBattleList.length - 1];
    }
    chooseHand(userName, hand) {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return;
        }
        battle.addUserHand(userName, hand);
    }
    isAllUserChooseHand() {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return false;
        }
        const isAllUserChooseHand = battle.userHandList().length === this._userList.length;
        return isAllUserChooseHand;
    }
    judgeBattle() {
        const battle = this.currentBattle();
        if (battle === undefined) {
            throw new Error("battle is not found");
        }
        // TODO: 勝者が 2 人以上なら次のラウンドへ...
        return {
            roundWinnerList: battle.judge(),
            userHandList: battle.userHandList(),
        };
    }
    chosenUserNameList() {
        const battle = this.currentBattle();
        if (battle === undefined) {
            return [];
        }
        return battle.userHandList().map((userHand) => userHand.userName);
    }
    toRepository() {
        return {
            roomId: this.id.value,
            userNameList: this._userList.map((user) => user.userName()),
            numberOfWinners: this._numberOfWinners,
            winnerNameList: this._winnerNameList,
            loserNameList: this._loserNameList,
            isStarted: this._isStarted,
            isEnded: this._isEnded,
            rpsBattleList: this._rpsBattleList.map((battle) => battle.toObject()),
        };
    }
}
exports.Room = Room;
//# sourceMappingURL=room.entity.js.map