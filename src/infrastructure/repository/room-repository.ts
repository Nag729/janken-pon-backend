import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { HandType } from "../../domain/model/hand";
import { Room } from "../../domain/model/room";
import { RoomId } from "../../domain/model/room-id.value";
import { DynamoDBDataStore, QueryResult } from "../datastore/dynamodb.datastore";

interface RoomRepositoryDependencies {
    dynamoDBDataStore?: DynamoDBDataStore;
}

export type DBRoom = {
    roomId: string;
    masterName: string;
    userNameList: string[];
    isStarted: boolean;
    isEnded: boolean;
    winner: string | undefined;
    winnerHand: string | undefined;
};

export class RoomRepository implements RoomRepositoryInterface {
    private readonly datastore: DynamoDBDataStore;
    private readonly tableName: string;
    private readonly ttl: number = 35 * 24 * 60 * 60;

    constructor({ dynamoDBDataStore = new DynamoDBDataStore() }: RoomRepositoryDependencies) {
        this.datastore = dynamoDBDataStore;
        this.tableName = `jankenPonRoom`;
    }

    public async generateNewRoomId(): Promise<RoomId> {
        let roomId: RoomId;

        for (let i = 0; i < 3; i++) {
            roomId = new RoomId(uuidv4());
            const existRoom: boolean = !!(await this.fetchRoom(roomId));
            if (!existRoom) {
                break;
            }
        }
        return roomId!;
    }

    public async fetchRoom(roomId: RoomId): Promise<Room | undefined> {
        const queryResult: QueryResult<DBRoom> = await this.datastore.queryByPrimaryKey({
            tableName: this.tableName,
            partitioningKeyParams: {
                keyName: "roomId",
                attributeValues: { sign: "=", values: [roomId.value] },
            },
        });
        const room: DBRoom | undefined = queryResult.Items.pop();
        return room ? this.createRoomFromDB(room) : undefined;
    }

    public async createRoom(room: Room): Promise<void> {
        const repo = room.toRepository();
        const unixtime = dayjs().unix();

        await this.datastore.put(this.tableName, { ...repo, unixtime }, unixtime + this.ttl);
    }

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

    private createRoomFromDB(dbRoom: DBRoom): Room {
        return new Room({
            roomId: new RoomId(dbRoom.roomId),
            userNameList: dbRoom.userNameList,
            isStarted: dbRoom.isStarted,
            isEnded: dbRoom.isEnded,
            winner: dbRoom.winner,
            winnerHand: (dbRoom.winnerHand as HandType) ?? undefined,
        });
    }
}
