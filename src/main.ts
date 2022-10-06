import { queue } from "async";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { RoomError, RoomUsecase } from "./application/usecase/room-usecase";
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
 * Usecase
 */
const roomUsecase = new RoomUsecase({});

/**
 * Queue
 */
const enterRoomJobQueue = queue(async (roomId: string) => {
    await roomUsecase.enterNextRound(new RoomId(roomId));
    io.sockets.in(roomId).emit(`next-round-entered`);
}, 1);

const chooseHandQueue = queue(async ({ roomId, userName, hand }: { roomId: string; userName: string; hand: Hand }) => {
    const room: Room = await roomUsecase.chooseHand(new RoomId(roomId), userName, hand);
    io.sockets.in(roomId).emit(`rps-hand-chosen`, {
        userNameList: room.chosenUserNameList(),
    });

    const isAllUserChooseHand: boolean = roomUsecase.isAllUserChooseHand(room);
    if (!isAllUserChooseHand) {
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
}, 1);

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
    const errorList: RoomError[] = await roomUsecase.verifyRoom(new RoomId(roomId));
    res.send(errorList);
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
    /**
     * Event: Joins to Socket.IO Room
     */
    socket.on(`room`, async ({ roomId, userName }: { roomId: string; userName: string }) => {
        console.log(`NEW USER ${userName} JOIN TO ROOM ✌️`);
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
            enterRoomJobQueue.push(roomId);
        });

        /**
         * Event: Choose Hand by User
         */
        socket.on(`choose-hand`, async ({ hand }: { hand: Hand }) => {
            chooseHandQueue.push({ roomId, userName, hand });
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
