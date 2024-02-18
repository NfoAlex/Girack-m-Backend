// 実行 :: npx ts-node ./src/INDEX.ts

import fs from "fs";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

//DB用に必要なディレクトリを作成
try{fs.mkdirSync("./records/");}catch(e){}

//DB整備
import "./db/InitUser";
import "./db/InitServer";
import "./db/InitRole";

const httpServer = createServer();
const io:Server = new Server(httpServer, {
  //オプション
  maxHttpBufferSize: 1e8, // 100MBごとの通信を許可
});

//SocketHandlerインポート
require("./socketHandler/fetchInfo.ts")(io);

//共通ハンドラ
io.on("connection", (socket:Socket) => {
  console.log("*** 接続検知 ***");
});

httpServer.listen(33333, () =>{
  console.log("------ Girack-m-Backend ------");
  console.log("INDEX :: サーバーホスト開始 -> ", 33333);
});
