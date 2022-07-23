"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomUsecase = void 0;
const room_entity_1 = require("../../domain/model/room.entity");
const user_value_1 = require("../../domain/model/user.value");
const room_repository_1 = require("../../infrastructure/repository/room-repository");
class RoomUsecase {
    constructor({ roomRepository = new room_repository_1.RoomRepository({}) }) {
        this._roomRepository = roomRepository;
    }
    async generateNewRoomId() {
        return this._roomRepository.generateNewRoomId();
    }
    async createRoom(roomId, numberOfWinners) {
        const newRoom = new room_entity_1.Room({ roomId, userNameList: [], numberOfWinners });
        await this._roomRepository.createRoom(newRoom);
    }
    async fetchRoom(roomId) {
        return this._roomRepository.fetchRoom(roomId);
    }
    async verifyUserName(roomId, userName) {
        const room = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }
        return room.verifyUserName(userName);
    }
    async joinRoom(roomId, userName) {
        const room = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }
        room.addUser(new user_value_1.User({ userName }));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }
    async leaveRoom(roomId, userName) {
        const room = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }
        room.removeUser(new user_value_1.User({ userName }));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }
    async startRps(roomId) {
        const room = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }
        if (room.isStarted()) {
            throw new Error(`Already started roomId: ${roomId.value}`);
        }
        room.startRps();
        await this._roomRepository.updateRoomStarted(room);
        await this._roomRepository.updateRpsBattleList(room);
    }
    async chooseHand(roomId, userName, hand) {
        const room = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }
        room.chooseHand(userName, hand);
        await this._roomRepository.updateRpsBattleList(room);
        return room;
    }
    isAllUserChooseHand(room) {
        return room.isAllUserChooseHand();
    }
    async judgeBattle(room) {
        const battleResult = room.judgeBattle();
        const isDraw = battleResult.roundWinnerList.length === 0;
        if (isDraw) {
            room.startNextRound();
            await this._roomRepository.updateRpsBattleList(room);
        }
        return battleResult;
    }
}
exports.RoomUsecase = RoomUsecase;
//# sourceMappingURL=room-usecase.js.map