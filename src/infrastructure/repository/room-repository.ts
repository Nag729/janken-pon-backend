import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { RoomId } from "../../domain/model/room-id.value";
import { Room } from "../../domain/model/room.entity";
import { RpsBattle, UserHand } from "../../domain/model/rps-battle.value";
import { DynamoDBDataStore, QueryResult } from "../datastore/dynamodb.datastore";

interface RoomRepositoryDependencies {
    dynamoDBDataStore?: DynamoDBDataStore;
}

type DBRpsBattle = {
    round: number;
    userHandList: {
        userName: string;
        hand: string;
    }[];
};

export type DBRoom = {
    roomId: string;
    userNameList: string[];
    numberOfWinners: number;
    isStarted: boolean;
    rpsBattleList: DBRpsBattle[];
    confirmedWinnerNameList: string[];
    confirmedLoserNameList: string[];
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
    public async fetchRoom(roomId: RoomId): Promise<Room | undefined> {
        const queryResult: QueryResult<DBRoom> = await this.datastore.queryByPrimaryKey({
            tableName: this.tableName,
            partitioningKeyParams: {
                keyName: "roomId",
                attributeValues: { sign: "=", values: [roomId.value] },
            },
        });

        const room: DBRoom | undefined = queryResult.Items.pop();
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
    public async updateRoomUserNameList(room: Room): Promise<void> {
        const userNameList = room.toRepository().userNameList;
        await this.datastore.update(
            this.tableName,
            {
                roomId: room.id.value,
            },
            `set userNameList = :userNameList`,
            {
                ":userNameList": userNameList,
            },
        );
    }

    public async updateRoomStarted(room: Room): Promise<void> {
        const isStarted = room.toRepository().isStarted;
        await this.datastore.update(
            this.tableName,
            {
                roomId: room.id.value,
            },
            `set isStarted = :isStarted`,
            {
                ":isStarted": isStarted,
            },
        );
    }

    public async updateRpsBattleList(room: Room): Promise<void> {
        const rpsBattleList = room.toRepository().rpsBattleList;
        await this.datastore.update(
            this.tableName,
            {
                roomId: room.id.value,
            },
            `set rpsBattleList = :rpsBattleList`,
            {
                ":rpsBattleList": rpsBattleList,
            },
        );
    }

    private createRoomFromDB(db: DBRoom): Room {
        return new Room({
            roomId: new RoomId(db.roomId),
            userNameList: db.userNameList,
            numberOfWinners: db.numberOfWinners,
            isStarted: db.isStarted,
            rpsBattleList: db.rpsBattleList.map(this.createRpsBattleFromDB),
            confirmedWinnerNameList: db.confirmedWinnerNameList,
            confirmedLoserNameList: db.confirmedLoserNameList,
        });
    }

    private createRpsBattleFromDB(db: DBRpsBattle): RpsBattle {
        return new RpsBattle({
            round: db.round,
            userHandList: db.userHandList as UserHand[],
        });
    }
}
