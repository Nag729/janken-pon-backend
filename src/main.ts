import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomController } from "./application/controller/room-controller";
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
 * Controller
 */
const roomController = new RoomController({});

app.get(`/`, (_, res) => {
    res.send(`🚀 Server listening on port:${PORT} 🚀`);
});

app.post(`/generate/room-id`, async (_, res) => {
    const newRoomId: RoomId = await roomController.generateNewRoomId();
    console.log(`Generate new roomId: ${newRoomId.value}`);
    res.send(newRoomId.value);
});

app.post(`/create/room`, async (req, res) => {
    const { roomId } = req.body as { roomId: string; userName: string };
    await roomController.createRoom(new RoomId(roomId));
    res.send(`🚀 Room created: ${roomId} 🚀`);
});

/**
 * Socket.io
 */
io.on(`connection`, (socket) => {
    console.log(`NEW USER CONNECTED ✌️`, socket.id);

    /**
     * Event: New participant joins the room.
     */
    socket.on(`join-room`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        const userNameList: string[] = await roomController.joinToRoom(new RoomId(roomId), userName);
        io.emit(`update-user-name-list`, { userNameList });
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
