import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  //オプション
  maxHttpBufferSize: 1e8, // 100MBごとの通信を許可
});

io.on("connection", (socket:Socket) => {
  console.log("")
});

httpServer.listen(33333, () =>{
  console.log("INDEX :: サーバーホスト開始 -> ", 33333);
});