import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Hand } from "../../domain/model/hand.value";
import { RoomId } from "../../domain/model/room-id.value";
import { Room } from "../../domain/model/room.entity";
import { UserHand, UserHandObject } from "../../domain/model/user-hand.value";
import { User, UserName } from "../../domain/model/user.value";
import { RoomRepository } from "../../infrastructure/repository/room-repository";

export interface RoomUsecaseDependencies {
    roomRepository?: RoomRepositoryInterface;
}

export type RoomError = `NOT_EXIST_ROOM` | `ALREADY_STARTED_ROOM` | `MAX_PLAYER`;

export class RoomUsecase {
    private readonly _roomRepository: RoomRepositoryInterface;

    constructor({ roomRepository = new RoomRepository({}) }: RoomUsecaseDependencies) {
        this._roomRepository = roomRepository;
    }

    public async generateNewRoomId(): Promise<RoomId> {
        return this._roomRepository.generateNewRoomId();
    }

    public async createRoom(roomId: RoomId): Promise<void> {
        const newRoom: Room = new Room({ roomId, userList: [] });
        await this._roomRepository.createRoom(newRoom);
    }

    public async verifyRoom(roomId: RoomId): Promise<RoomError[]> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);

        if (room === undefined) return [`NOT_EXIST_ROOM`];
        if (room.isStarted()) return [`ALREADY_STARTED_ROOM`];
        if (room.isMaxPlayer()) return [`MAX_PLAYER`];
        return [];
    }

    public async verifyUserName(roomId: RoomId, userName: UserName): Promise<boolean> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        return room.verifyUserName(userName);
    }

    public async joinRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.addUser(new User({ userName }));
        await this._roomRepository.updateRoom(room);
        return room.userNameList();
    }

    public async leaveRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.removeUser(new User({ userName }));
        await this._roomRepository.updateRoom(room);
        return room.userNameList();
    }

    public async updateNumberOfWinners(roomId: RoomId, numberOfWinners: number): Promise<Room> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.updateNumberOfWinners(numberOfWinners);
        await this._roomRepository.updateRoom(room);
        return room;
    }

    public async startRps(room: Room): Promise<void> {
        if (room.isStarted()) {
            throw new Error(`Already started roomId: ${room.id.value}`);
        }

        room.startRps();
        await this._roomRepository.updateRoom(room);
    }

    public async chooseHand(roomId: RoomId, userName: UserName, hand: Hand): Promise<Room> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.chooseHand(new UserHand({ userName, hand }));
        await this._roomRepository.updateRoom(room);
        return room;
    }

    public isAllUserChooseHand(room: Room): boolean {
        return room.isAllUserChooseHand();
    }

    public async judgeRound(room: Room): Promise<{ roundWinnerList: UserName[]; userHandList: UserHandObject[] }> {
        const { roundWinnerList, userHandList } = room.judgeRound();
        await this._roomRepository.updateRoom(room);
        return {
            roundWinnerList,
            userHandList: userHandList.map((userHand) => userHand.toObject()),
        };
    }

    public async enterNextRound(roomId: RoomId): Promise<void> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.enterNextRound();
        await this._roomRepository.updateRoom(room);
    }

    public isCompleted(room: Room): boolean {
        return room.isCompleted();
    }

    public winnerList(room: Room): UserName[] {
        return room.winnerList();
    }

    public loserList(room: Room): UserName[] {
        return room.loserList();
    }
}
