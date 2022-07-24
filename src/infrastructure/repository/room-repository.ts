import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Hand } from "../../domain/model/hand.value";
import { RoomId } from "../../domain/model/room-id.value";
import { Room } from "../../domain/model/room.entity";
import { RpsRound } from "../../domain/model/rps-round.value";
import { UserHand } from "../../domain/model/user-hand.value";
import { User, WinOrLose } from "../../domain/model/user.value";
import { DynamoDBDataStore, QueryResult } from "../datastore/dynamodb.datastore";
const equal = require("deep-equal");

interface RoomRepositoryDependencies {
    dynamoDBDataStore?: DynamoDBDataStore;
}

export type DBUser = {
    userName: string;
    winOrLose?: string;
};

export type DBRpsRound = {
    round: number;
    userHandList: {
        userName: string;
        hand: string;
    }[];
};

export type DBRoom = {
    roomId: string;
    userList: DBUser[];
    numberOfWinners: number;
    isStarted: boolean;
    rpsRoundList: DBRpsRound[];
};

export class RoomRepository implements RoomRepositoryInterface {
    private readonly datastore: DynamoDBDataStore;
    private readonly tableName: string;
    private readonly ttl: number = 35 * 24 * 60 * 60;

    constructor({ dynamoDBDataStore = new DynamoDBDataStore() }: RoomRepositoryDependencies) {
        this.datastore = dynamoDBDataStore;
        this.tableName = `jankenPonRoom`;
    }

    /**
     * FETCH
     */
    private async fetchDBRoom(roomId: RoomId): Promise<DBRoom | undefined> {
        const queryResult: QueryResult<DBRoom> = await this.datastore.queryByPrimaryKey({
            tableName: this.tableName,
            partitioningKeyParams: {
                keyName: "roomId",
                attributeValues: { sign: "=", values: [roomId.value] },
            },
        });
        return queryResult.Items.pop();
    }

    public async fetchRoom(roomId: RoomId): Promise<Room | undefined> {
        const room: DBRoom | undefined = await this.fetchDBRoom(roomId);
        return !!room ? this.createRoomFromDB(room) : undefined;
    }

    public async fetchShouldExistRoom(roomId: RoomId): Promise<Room> {
        const room: Room | undefined = await this.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Room not found: ${roomId.value}`);
        }
        return room;
    }

    /**
     * CREATE
     */
    public async generateNewRoomId(): Promise<RoomId> {
        let roomId: RoomId;

        for (let i = 0; i < 3; i++) {
            roomId = new RoomId(uuidv4());
            const existRoom: boolean = !!(await this.fetchRoom(roomId));
            if (!existRoom) break;
        }
        return roomId!;
    }

    public async createRoom(room: Room): Promise<void> {
        const repo = room.toRepository();
        const unixtime = dayjs().unix();

        await this.datastore.put(this.tableName, { ...repo, unixtime }, unixtime + this.ttl);
    }

    /**
     * UPDATE
     */
    public async updateRoom(room: Room): Promise<void> {
        const oldDBRoom: DBRoom | undefined = await this.fetchDBRoom(room.id);
        if (oldDBRoom === undefined) {
            return;
        }

        const newDBRoom: DBRoom = room.toRepository();

        // check diff
        const updatedUserList: boolean = !equal(oldDBRoom.userList, newDBRoom.userList);
        if (updatedUserList) {
            await this.updateRoomUserList(room.id.value, newDBRoom.userList);
        }

        const updatedIsStarted: boolean = oldDBRoom.isStarted !== newDBRoom.isStarted;
        if (updatedIsStarted) {
            await this.updateRoomStarted(room.id.value, newDBRoom.isStarted);
        }

        const updatedRpsRoundList: boolean = !equal(oldDBRoom.rpsRoundList, newDBRoom.rpsRoundList);
        if (updatedRpsRoundList) {
            await this.updateRpsRoundList(room.id.value, newDBRoom.rpsRoundList);
        }
    }

    private async updateRoomUserList(roomId: string, userList: DBUser[]): Promise<void> {
        await this.datastore.update(this.tableName, { roomId }, `set userList = :userList`, {
            ":userList": userList,
        });
    }

    private async updateRoomStarted(roomId: string, isStarted: boolean): Promise<void> {
        await this.datastore.update(this.tableName, { roomId }, `set isStarted = :isStarted`, {
            ":isStarted": isStarted,
        });
    }

    private async updateRpsRoundList(roomId: string, rpsRoundList: DBRpsRound[]): Promise<void> {
        await this.datastore.update(this.tableName, { roomId }, `set rpsRoundList = :rpsRoundList`, {
            ":rpsRoundList": rpsRoundList,
        });
    }

    private createRoomFromDB(db: DBRoom): Room {
        return new Room({
            roomId: new RoomId(db.roomId),
            userList: db.userList.map(
                (user) => new User({ userName: user.userName, winOrLose: user.winOrLose as WinOrLose | undefined }),
            ),
            numberOfWinners: db.numberOfWinners,
            isStarted: db.isStarted,
            rpsRoundList: db.rpsRoundList.map(this.createRpsRoundFromDB),
        });
    }

    private createRpsRoundFromDB(db: DBRpsRound): RpsRound {
        return new RpsRound({
            round: db.round,
            userHandList: db.userHandList.map(
                (userHand) => new UserHand({ userName: userHand.userName, hand: userHand.hand as Hand }),
            ),
        });
    }
}
