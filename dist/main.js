"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const room_usecase_1 = require("./application/usecase/room-usecase");
const room_id_value_1 = require("./domain/model/room-id.value");
require("dotenv").config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: `*`,
        methods: [`GET`, `POST`],
    },
});
const PORT = process.env.PORT || 3001;
/**
 * Usecase
 */
const roomUsecase = new room_usecase_1.RoomUsecase({});
app.get(`/`, (_, res) => {
    res.send(`🚀 Server listening on port:${PORT} 🚀`);
});
app.post(`/generate/room-id`, async (_, res) => {
    const newRoomId = await roomUsecase.generateNewRoomId();
    console.log(`🚀 ROOM_ID GENERATED: ${newRoomId.value} 🚀`);
    res.send(newRoomId.value);
});
app.post(`/create/room`, async (req, res) => {
    const numberOfWinners = 1; // FIXME: フロントエンドから受け取る
    const { roomId } = req.body;
    await roomUsecase.createRoom(new room_id_value_1.RoomId(roomId), numberOfWinners);
    res.send(`🚀 ROOM CREATED: ${roomId} 🚀`);
});
app.post(`/verify/room`, async (req, res) => {
    const { roomId } = req.body;
    const existRoom = !!(await roomUsecase.fetchRoom(new room_id_value_1.RoomId(roomId)));
    res.send(existRoom);
});
app.post(`/verify/user-name`, async (req, res) => {
    const { roomId, userName } = req.body;
    const isOk = await roomUsecase.verifyUserName(new room_id_value_1.RoomId(roomId), userName);
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
    socket.on(`room`, async ({ roomId, userName }) => {
        // TODO: すでにスタートしてる部屋には参加できないようにする
        socket.join(roomId);
        const userNameList = await roomUsecase.joinRoom(new room_id_value_1.RoomId(roomId), userName);
        io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });
        /**
         * Event: Start RPS
         */
        socket.on(`start-rps`, async () => {
            await roomUsecase.startRps(new room_id_value_1.RoomId(roomId));
            io.sockets.in(roomId).emit(`rps-started`);
        });
        /**
         * Event: Choose Hand by User
         */
        socket.on(`choose-hand`, async ({ hand }) => {
            console.log(`✌️ choose-hand ✌️`, { userName, hand });
            const room = await roomUsecase.chooseHand(new room_id_value_1.RoomId(roomId), userName, hand);
            io.sockets.in(roomId).emit(`rps-hand-chosen`, {
                userNameList: room.chosenUserNameList(),
            });
            const isAllUserChooseHand = roomUsecase.isAllUserChooseHand(room);
            if (!isAllUserChooseHand) {
                return;
            }
            const battleResult = await roomUsecase.judgeBattle(room);
            io.sockets.in(roomId).emit(`round-settled`, { battleResult });
        });
        /**
         * Event: Disconnect
         */
        socket.on(`disconnect`, async () => {
            console.log(`USER DISCONNECTED 👋`, roomId, userName);
            // NOTE: notify other users in the room.
            const userNameList = await roomUsecase.leaveRoom(new room_id_value_1.RoomId(roomId), userName);
            io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });
        });
    });
});
httpServer.listen(PORT, () => {
    console.log(`🚀 SERVER LISTENING ON PORT:${PORT} 🚀`);
});
// ref: https://shadowsmith.com/how-to-deploy-an-express-api-to-vercel
module.exports = app;
//# sourceMappingURL=main.js.map