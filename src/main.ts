import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomUsecase } from "./application/usecase/room-usecase";
import { Hand } from "./domain/model/hand.value";
import { RoomId } from "./domain/model/room-id.value";
import { UserHand } from "./domain/model/rps-battle.value";
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:3000`,
        methods: [`GET`, `POST`],
    },
});
const PORT = process.env.PORT || 3001;

/**
 * Usecase
 */
const roomUsecase = new RoomUsecase({});

app.get(`/`, (_, res) => {
    res.send(`🚀 Server listening on port:${PORT} 🚀`);
});

app.post(`/generate/room-id`, async (_, res) => {
    const newRoomId: RoomId = await roomUsecase.generateNewRoomId();
    console.log(`🚀 ROOM_ID GENERATED: ${newRoomId.value} 🚀`);
    res.send(newRoomId.value);
});

app.post(`/create/room`, async (req, res) => {
    const { roomId } = req.body as { roomId: string };
    await roomUsecase.createRoom(new RoomId(roomId));
    res.send(`🚀 ROOM CREATED: ${roomId} 🚀`);
});

app.post(`/verify/room`, async (req, res) => {
    const { roomId } = req.body as { roomId: string };
    const existRoom: boolean = !!(await roomUsecase.fetchRoom(new RoomId(roomId)));
    res.send(existRoom);
});

app.post(`/verify/user-name`, async (req, res) => {
    const { roomId, userName } = req.body as { roomId: string; userName: string };
    const isOk: boolean = await roomUsecase.verifyUserName(new RoomId(roomId), userName);
    res.send(isOk);
});

/**
 * Socket.io
 */
io.on(`connection`, (socket) => {
    console.log(`NEW USER CONNECTED ✌️`);

    /**
     * Event: Joins to Socket.IO Room
     */
    socket.on(`room`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        // TODO: すでにスタートしてる部屋には参加できないようにする

        socket.join(roomId);
        const userNameList: string[] = await roomUsecase.joinRoom(new RoomId(roomId), userName);
        io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });

        /**
         * Event: Start RPS
         */
        socket.on(`start-rps`, async () => {
            await roomUsecase.startRps(new RoomId(roomId));
            io.sockets.in(roomId).emit(`rps-started`);
        });

        /**
         * Event: Choose Hand by User
         */
        socket.on(`choose-hand`, async ({ hand }: { hand: Hand }) => {
            const latestUserHandList: UserHand[] = await roomUsecase.chooseHand(new RoomId(roomId), userName, hand);
            io.sockets.in(roomId).emit(`rps-hand-chosen`, latestUserHandList);
        });

        /**
         * Event: Disconnect
         */
        socket.on(`disconnect`, async () => {
            console.log(`USER DISCONNECTED 👋`, roomId, userName);
            // NOTE: notify other users in the room.
            const userNameList: string[] = await roomUsecase.leaveRoom(new RoomId(roomId), userName);
            io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 SERVER LISTENING ON PORT:${PORT} 🚀`);
});
