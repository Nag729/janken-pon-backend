import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomUsecase } from "./application/usecase/room-usecase";
import { RoomId } from "./domain/model/room-id.value";
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
    console.log(`Generate new roomId: ${newRoomId.value}`);
    res.send(newRoomId.value);
});

app.post(`/create/room`, async (req, res) => {
    const { roomId } = req.body as { roomId: string };
    await roomUsecase.createRoom(new RoomId(roomId));
    res.send(`🚀 Room created: ${roomId} 🚀`);
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
    console.log(`NEW USER CONNECTED ✌️`, socket.id);

    /**
     * Event: Joins to Socket.IO Room
     */
    socket.on(`join-to-room`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        // TODO: 存在しない room の場合はエラーにする
        socket.join(roomId);
        const userNameList: string[] = await roomUsecase.joinToRoom(new RoomId(roomId), userName);
        io.sockets.in(roomId).emit(`update-user-name-list`, { userNameList });
    });

    /**
     * Event: Disconnect
     */
    socket.on(`disconnect`, (reason) => {
        // TODO: 接続されてる人を見てその人を部屋から外す？
        console.log(reason);
        console.log(`USER DISCONNECTED 👋`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port:${PORT} 🚀`);
});
