import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Room } from "../../domain/model/room";
import { RoomId } from "../../domain/model/room-id.value";
import { User, UserName } from "../../domain/model/user";
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

    public async createRoom(roomId: RoomId): Promise<void> {
        const newRoom: Room = new Room({ roomId });
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

        room.addUser(new User(userName));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async leaveRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        room.removeUser(new User(userName));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }
}
