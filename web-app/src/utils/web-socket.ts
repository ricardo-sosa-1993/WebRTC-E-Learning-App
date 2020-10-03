import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";

let socket: any;

function getWebSocket(roomId: string, selfUuid: string, userName: string) {
  if (socket) return socket;

  socket = socketIOClient(ENDPOINT);
  socket.emit("ready", { roomId, uuid: selfUuid, userName });

  return socket;
}

export { getWebSocket };
