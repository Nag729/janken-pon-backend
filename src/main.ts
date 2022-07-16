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

app.get(`/`, (_req, res) => {
    res.send(`🚀 Server listening on port:${PORT} 🚀`);
});

app.post(`/create/room`, async (req, res) => {
    console.log(`req.body:`, req.body);
    const { roomId, userName } = req.body as { roomId: string; userName: string };
    await roomController.createRoom(new RoomId(roomId), userName);
    res.send(`🚀 Room created: ${roomId} 🚀`);
});

app.get(`/check/game-master`, async (req, res) => {
    const { roomId, userName } = req.query as { roomId: string; userName: string };
    const isGameMaster = await roomController.isGameMaster(new RoomId(roomId), userName);
    res.send({ isGameMaster });
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
