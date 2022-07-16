import { RoomRepositoryInterface } from "../../domain/interface/room-repository.interface";
import { Room } from "../../domain/model/room";
import { RoomId } from "../../domain/model/room-id.value";
import { User, UserName } from "../../domain/model/user";
import { RoomRepository } from "../../infrastructure/repository/room-repository";

export interface RoomControllerDependencies {
    roomRepository?: RoomRepositoryInterface;
}

export class RoomController {
    private readonly _roomRepository: RoomRepositoryInterface;

    constructor({ roomRepository = new RoomRepository({}) }: RoomControllerDependencies) {
        this._roomRepository = roomRepository;
    }

    public async generateNewRoomId(): Promise<RoomId> {
        const roomId: RoomId = await this._roomRepository.generateNewRoomId();
        return roomId;
    }

    public async createRoom(roomId: RoomId, userName: UserName): Promise<void> {
        const newRoom: Room = new Room({ roomId, masterName: userName });
        await this._roomRepository.createRoom(newRoom);
    }

    public async joinToRoom(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        if (room === undefined) {
            throw new Error(`Not found roomId: ${roomId.value}`);
        }

        room.addUser(new User(userName));
        await this._roomRepository.updateRoomUserNameList(room);
        return room.userNameList();
    }

    public async isGameMaster(roomId: RoomId, userName: UserName): Promise<boolean> {
        const room: Room | undefined = await this._roomRepository.fetchRoom(roomId);
        return room ? room.isGameMaster(userName) : false;
    }
}
