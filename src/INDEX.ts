import fs from "fs";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

//DB用に必要なディレクトリを作成
try{fs.mkdirSync("./records/");}catch(e){}

//DB整備
import "./db/InitUser";
import "./db/InitServer";

const httpServer = createServer();
const io = new Server(httpServer, {
  //オプション
  maxHttpBufferSize: 1e8, // 100MBごとの通信を許可
});

io.on("connection", (socket:Socket) => {
  console.log("*** 接続検知 ***");
});

httpServer.listen(33333, () =>{
  console.log("------ Girack ------");
  console.log("INDEX :: サーバーホスト開始 -> ", 33333);
});