import { Server } from "socket.io";

export const fetchNameList = async (io: Server): Promise<string[]> => {
  const sockets = await io.fetchSockets();
  const nameList = sockets
    .map((socket) => socket.data.name)
    .filter((str) => str !== undefined);
  return nameList;
};
