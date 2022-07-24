import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Hand } from "../../domain/model/hand.value";
import { RoomId } from "../../domain/model/room-id.value";
import { RoundResult, Room } from "../../domain/model/room.entity";
import { UserHand } from "../../domain/model/user-hand.value";
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

    public async createRoom(roomId: RoomId, numberOfWinners: number): Promise<void> {
        const newRoom: Room = new Room({ roomId, userNameList: [], numberOfWinners });
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
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async leaveRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.removeUser(new User({ userName }));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async startRps(roomId: RoomId): Promise<void> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        if (room.isStarted()) {
            throw new Error(`Already started roomId: ${roomId.value}`);
        }

        room.startRps();
        await this._roomRepository.updateRoomStarted(room);
        await this._roomRepository.updateRpsRoundList(room);
    }

    public async chooseHand(roomId: RoomId, userName: UserName, hand: Hand): Promise<Room> {
        const room: Room = await this._roomRepository.fetchShouldExistRoom(roomId);
        room.chooseHand(new UserHand({ userName, hand }));
        await this._roomRepository.updateRpsRoundList(room);
        return room;
    }

    public isAllUserChooseHand(room: Room): boolean {
        return room.isAllUserChooseHand();
    }

    public async judgeRound(room: Room): Promise<RoundResult> {
        const roundResult: RoundResult = room.judgeRound();
        const isDraw: boolean = roundResult.roundWinnerList.length === 0;
        if (isDraw) {
            room.startNextRound();
            await this._roomRepository.updateRpsRoundList(room);
        }
        return roundResult;
    }

    public isCompleted(room: Room): boolean {
        return room.isCompleted();
    }

    public winnerUserNameList(room: Room): UserName[] {
        return room.winnerUserNameList();
    }
}
