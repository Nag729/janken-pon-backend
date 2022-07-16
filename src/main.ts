import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomController } from "./application/controller/room-controller";
import { RoomId } from "./domain/model/room-id.value";
require("dotenv").config();

const app = express();
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

/**
 * Socket.io
 */
io.on(`connection`, (socket) => {
    console.log(`NEW USER CONNECTED ✌️`, socket.id);

    /**
     * Event: New participant joins the room.
     */
    socket.on(`join`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        console.log(roomId, userName);
        const userNameList: string[] = await roomController.handleJoin(new RoomId(roomId), userName);
        io.emit(`update-user-name-list`, userNameList); // NOTE: emit userNameList to all sockets.
    });

    /**
     * Event: Disconnect
     */
    socket.on(`disconnect`, () => {
        console.log(`USER DISCONNECTED 👋`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port:${PORT} 🚀`);
});
