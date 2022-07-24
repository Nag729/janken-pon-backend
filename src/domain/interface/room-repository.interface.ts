import { Room } from "../model/room.entity";
import { RoomId } from "../model/room-id.value";

export interface RoomRepositoryInterface {
    /**
     * FETCH
     */
    fetchRoom(roomId: RoomId): Promise<Room | undefined>;
    fetchShouldExistRoom(roomId: RoomId): Promise<Room>;

    /**
     * CREATE
     */
    generateNewRoomId(): Promise<RoomId>;
    createRoom(room: Room): Promise<void>;

    /**
     * UPDATE
     */
    updateRoomUserNameList(room: Room): Promise<void>;
    updateRoomStarted(room: Room): Promise<void>;
    updateRpsRoundList(room: Room): Promise<void>;
}
