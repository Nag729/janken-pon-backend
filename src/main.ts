import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RestApiController } from "./application/controller/rest-api-controller";
import { RoomUsecase } from "./application/usecase/room-usecase";
import { Hand } from "./domain/model/hand.value";
import { RoomId } from "./domain/model/room-id.value";
import { Room } from "./domain/model/room.entity";
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: `*`,
        methods: [`GET`, `POST`],
    },
});
const PORT = process.env.PORT || 3001;

/**
 * Dependent Controller
 */
const restApiController = new RestApiController({});
const roomUsecase = new RoomUsecase({});

/**
 * REST API
 */
app.get(`/`, (_, res) => {
    res.send(`🚀 Server listening on port:${PORT} 🚀`);
});
app.post(`/generate/room-id`, restApiController.generateNewRoomId);
app.post(`/create/room`, restApiController.createRoom);
app.post(`/verify/room`, restApiController.verifyRoom);
app.post(`/verify/user-name`, restApiController.verifyUserName);

/**
 * Socket.io
 */
io.on(`connection`, (socket) => {
    socket.on(`room`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        console.log(`NEW USER ${userName} JOIN TO ROOM ✌️`);
        /**
         * Event: Joins to Socket.IO Room
         */
        socket.join(roomId);
        const userNameList: string[] = await roomUsecase.joinRoom(new RoomId(roomId), userName);
        io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });

        /**
         * Event: Update Number of Winners
         */
        socket.on(`update-number-of-winners`, async ({ numberOfWinners }: { numberOfWinners: number }) => {
            io.sockets.in(roomId).emit(`number-of-winners-updated`, { numberOfWinners });
        });

        /**
         * Event: Start RPS
         */
        socket.on(`start-rps`, async ({ numberOfWinners }: { numberOfWinners: number }) => {
            const room: Room = await roomUsecase.updateNumberOfWinners(new RoomId(roomId), numberOfWinners);
            await roomUsecase.startRps(room);
            io.sockets.in(roomId).emit(`rps-started`);
        });

        /**
         * Event: Enter Next Round
         */
        socket.on(`enter-next-round`, async () => {
            await roomUsecase.enterNextRound(new RoomId(roomId));
            io.sockets.in(roomId).emit(`next-round-entered`);
        });

        /**
         * Event: Choose Hand by User
         */
        socket.on(`choose-hand`, async ({ hand }: { hand: Hand }) => {
            const room: Room = await roomUsecase.chooseHand(new RoomId(roomId), userName, hand);
            io.sockets.in(roomId).emit(`rps-hand-chosen`, {
                userNameList: room.chosenUserNameList(),
            });

            if (!roomUsecase.isAllUserChooseHand(room)) {
                return;
            }

            const { roundWinnerList, userHandList } = await roomUsecase.judgeRound(room);
            const emitEventName = !roomUsecase.isCompleted(room) ? `round-settled` : `rps-completed`;

            io.sockets.in(roomId).emit(emitEventName, {
                roundWinnerList,
                userHandList,
                winnerList: roomUsecase.winnerList(room),
                loserList: roomUsecase.loserList(room),
            });
        });

        /**
         * Event: Disconnect
         */
        socket.on(`disconnect`, async () => {
            console.log(`USER DISCONNECTED 👋`, roomId, userName);
            const userNameList: string[] = await roomUsecase.leaveRoom(new RoomId(roomId), userName);
            io.sockets.in(roomId).emit(`user-name-list-updated`, { userNameList });
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 SERVER LISTENING ON PORT:${PORT} 🚀`);
});
