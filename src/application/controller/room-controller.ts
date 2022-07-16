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

    public async handleJoin(roomId: RoomId, userName: UserName): Promise<UserName[]> {
        const room: Room = (await this._roomRepository.fetchRoom(roomId)) ?? new Room({ roomId, masterName: userName });
        room.addUser(new User(userName));

        await this._roomRepository.saveRoom(room);
        return room.userNameList();
    }
}
