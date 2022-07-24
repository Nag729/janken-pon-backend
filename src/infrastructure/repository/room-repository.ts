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
    public async updateRoomUserList(room: Room): Promise<void> {
        const userList = room.toRepository().userList;
        await this.datastore.update(
            this.tableName,
            {
                roomId: room.id.value,
            },
            `set userList = :userList`,
            {
                ":userList": userList,
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

    public async updateRpsRoundList(room: Room): Promise<void> {
        const rpsRoundList = room.toRepository().rpsRoundList;
        await this.datastore.update(
            this.tableName,
            {
                roomId: room.id.value,
            },
            `set rpsRoundList = :rpsRoundList`,
            {
                ":rpsRoundList": rpsRoundList,
            },
        );
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
