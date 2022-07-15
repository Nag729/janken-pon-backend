import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Room } from "./class/Room";
import { User } from "./class/User";
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

app.get(`/`, (_req, res) => {
  res.send(`🚀 Server listening on port:${PORT} 🚀`);
});

io.on(`connection`, (socket) => {
  console.log(`NEW USER CONNECTED ✌️`, socket.id);

  /**
   * Event: New participant joins the room.
   */
  socket.on(
    `join`,
    async ({ userName, roomId }: { userName: string; roomId: string }) => {
      console.log(userName, roomId);

      // TODO: roomId をもとに DB から Room クラスをつくる
      // TODO: DynamoDB にテーブルを作って接続する!!
      const room = new Room(roomId, new User(userName));

      // NOTE: add user to room
      room.addUser(new User(userName));

      // NOTE: emit userNameList to all sockets.
      io.emit(`update-user-name-list`, room.userNameList());
    }
  );

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
