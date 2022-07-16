import { Room } from "../model/room";
import { RoomId } from "../model/room-id.value";

export interface RoomRepositoryInterface {
    generateNewRoomId(): Promise<RoomId>;
    fetchRoom(roomId: RoomId): Promise<Room | undefined>;
    saveRoom(room: Room): Promise<void>;
}
