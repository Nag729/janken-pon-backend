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
        socket.join(roomId);
        const userNameList: string[] = await roomUsecase.joinRoom(new RoomId(roomId), userName);
        io.sockets.in(roomId).emit(`update-user-name-list`, { userNameList });

        /**
         * Event: Disconnect
         */
        socket.on(`disconnect`, async () => {
            console.log(`USER DISCONNECTED 👋`, roomId, userName);
            // NOTE: notify other users in the room.
            const userNameList: string[] = await roomUsecase.leaveRoom(new RoomId(roomId), userName);
            io.sockets.in(roomId).emit(`update-user-name-list`, { userNameList });
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port:${PORT} 🚀`);
});
