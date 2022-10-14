import { Request, Response } from "express";
import { RoomId } from "../../domain/model/room-id.value";
import { RoomError, RoomUsecase } from "../usecase/room-usecase";

export interface RestApiControllerDependencies {
    roomUsecase?: RoomUsecase;
}

export class RestApiController {
    private readonly roomUsecase: RoomUsecase;

    constructor({ roomUsecase = new RoomUsecase({}) }: RestApiControllerDependencies) {
        this.roomUsecase = roomUsecase;
    }

    public generateNewRoomId = async (_: Request, res: Response): Promise<void> => {
        console.log(`*** generateNewRoomId ***`);
        console.log(this);
        const newRoomId: RoomId = await this.roomUsecase.generateNewRoomId();
        console.log(`🚀 ROOM_ID GENERATED: ${newRoomId.value} 🚀`);
        res.send(newRoomId.value);
    };

    public createRoom = async (req: Request, res: Response): Promise<void> => {
        const { roomId } = req.body as { roomId: string };
        await this.roomUsecase.createRoom(new RoomId(roomId));
        res.send(`🚀 ROOM CREATED: ${roomId} 🚀`);
    };

    public verifyRoom = async (req: Request, res: Response): Promise<void> => {
        const { roomId } = req.body as { roomId: string };
        const errorList: RoomError[] = await this.roomUsecase.verifyRoom(new RoomId(roomId));
        res.send(errorList);
    };

    public verifyUserName = async (req: Request, res: Response): Promise<void> => {
        const { roomId, userName } = req.body as { roomId: string; userName: string };
        const isOk: boolean = await this.roomUsecase.verifyUserName(new RoomId(roomId), userName);
        res.send(isOk);
    };
}
