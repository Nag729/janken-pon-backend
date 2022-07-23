"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRepository = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const uuid_1 = require("uuid");
const room_id_value_1 = require("../../domain/model/room-id.value");
const room_entity_1 = require("../../domain/model/room.entity");
const rps_battle_value_1 = require("../../domain/model/rps-battle.value");
const dynamodb_datastore_1 = require("../datastore/dynamodb.datastore");
class RoomRepository {
    constructor({ dynamoDBDataStore = new dynamodb_datastore_1.DynamoDBDataStore() }) {
        this.ttl = 35 * 24 * 60 * 60;
        this.datastore = dynamoDBDataStore;
        this.tableName = `jankenPonRoom`;
    }
    /**
     * FETCH
     */
    async fetchRoom(roomId) {
        const queryResult = await this.datastore.queryByPrimaryKey({
            tableName: this.tableName,
            partitioningKeyParams: {
                keyName: "roomId",
                attributeValues: { sign: "=", values: [roomId.value] },
            },
        });
        const room = queryResult.Items.pop();
        return room ? this.createRoomFromDB(room) : undefined;
    }
    /**
     * CREATE
     */
    async generateNewRoomId() {
        let roomId;
        for (let i = 0; i < 3; i++) {
            roomId = new room_id_value_1.RoomId((0, uuid_1.v4)());
            const existRoom = !!(await this.fetchRoom(roomId));
            if (!existRoom) {
                break;
            }
        }
        return roomId;
    }
    async createRoom(room) {
        const repo = room.toRepository();
        const unixtime = (0, dayjs_1.default)().unix();
        await this.datastore.put(this.tableName, { ...repo, unixtime }, unixtime + this.ttl);
    }
    /**
     * UPDATE
     */
    async updateRoomUserNameList(room) {
        const userNameList = room.toRepository().userNameList;
        await this.datastore.update(this.tableName, {
            roomId: room.id.value,
        }, `set userNameList = :userNameList`, {
            ":userNameList": userNameList,
        });
    }
    async updateRoomStarted(room) {
        const isStarted = room.toRepository().isStarted;
        await this.datastore.update(this.tableName, {
            roomId: room.id.value,
        }, `set isStarted = :isStarted`, {
            ":isStarted": isStarted,
        });
    }
    async updateRpsBattleList(room) {
        const rpsBattleList = room.toRepository().rpsBattleList;
        await this.datastore.update(this.tableName, {
            roomId: room.id.value,
        }, `set rpsBattleList = :rpsBattleList`, {
            ":rpsBattleList": rpsBattleList,
        });
    }
    createRoomFromDB(db) {
        return new room_entity_1.Room({
            roomId: new room_id_value_1.RoomId(db.roomId),
            userNameList: db.userNameList,
            numberOfWinners: db.numberOfWinners,
            winnerNameList: db.winnerNameList,
            loserNameList: db.loserNameList,
            isStarted: db.isStarted,
            isEnded: db.isEnded,
            rpsBattleList: db.rpsBattleList.map(this.createRpsBattleFromDB),
        });
    }
    createRpsBattleFromDB(db) {
        return new rps_battle_value_1.RpsBattle({
            round: db.round,
            userHandList: db.userHandList,
        });
    }
}
exports.RoomRepository = RoomRepository;
//# sourceMappingURL=room-repository.js.map