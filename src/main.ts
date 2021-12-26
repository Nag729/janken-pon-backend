import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fetchNameList } from "./functions/fetch-name-list";
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:3000`,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

app.get(`/`, (_req, res) => {
  res.send(`🚀 Server listening on port:${PORT} 🚀`);
});

io.on("connection", (socket) => {
  console.log(`A USER CONNECTED ✌️`, socket.id);

  /**
   * Event: New participant joins the room.
   */
  socket.on(`join`, async (name) => {
    // NOTE: update data.
    socket.data.name = name;

    // NOTE: emit nameList to all sockets.
    const nameList = await fetchNameList(io);
    io.emit(`update-name-list`, nameList);
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
