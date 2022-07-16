import { Room } from "../model/room";
import { RoomId } from "../model/room-id.value";

export interface RoomRepositoryInterface {
    generateNewRoomId(): Promise<RoomId>;
    fetchRoom(roomId: RoomId): Promise<Room | undefined>;
    createRoom(room: Room): Promise<void>;
    updateRoomUserNameList(room: Room): Promise<void>;
}
