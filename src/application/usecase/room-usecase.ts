import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Hand } from "../../domain/model/hand.value";
import { RoomId } from "../../domain/model/room-id.value";
import { BattleResult, Room } from "../../domain/model/room.entity";
import { User, UserName } from "../../domain/model/user.value";
import { RoomRepository } from "../../infrastructure/repository/room-repository";

export interface RoomUsecaseDependencies {
    roomRepository?: RoomRepositoryInterface;
}

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

    public async fetchRoom(roomId: RoomId): Promise<Room | undefined> {
        return this._roomRepository.fetchRoom(roomId);
    }

    public async verifyUserName(roomId: RoomId, userName: UserName): Promise<boolean> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        return room.verifyUserName(userName);
    }

    public async joinRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        room.addUser(new User({ userName }));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async leaveRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        room.removeUser(new User({ userName }));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async startRps(roomId: RoomId): Promise<void> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
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

    public async chooseHand(roomId: RoomId, userName: UserName, hand: Hand): Promise<Room> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        room.chooseHand(userName, hand);
        await this._roomRepository.updateRpsBattleList(room);
        return room;
    }

    public isAllUserChooseHand(room: Room): boolean {
        return room.isAllUserChooseHand();
    }

    public async judgeBattle(room: Room): Promise<BattleResult> {
        const battleResult: BattleResult = room.judgeBattle();

        const isDraw: boolean = battleResult.roundWinnerList.length === 0;
        if (isDraw) {
            room.startNextRound();
            await this._roomRepository.updateRpsBattleList(room);
        }
        return battleResult;
    }
}
