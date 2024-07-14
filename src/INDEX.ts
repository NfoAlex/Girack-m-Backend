// 実行 :: npx ts-node ./src/INDEX.ts

import fs from "fs";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express from "express";

const app = express();

//DB用に必要なディレクトリを作成
try{fs.mkdirSync("./records/");}catch(e){}
//ファイルアップロードの保存用ディレクトリ
try{fs.mkdirSync("./STORAGE/");}catch(e){}
try{fs.mkdirSync("./STORAGE/USERFILE");}catch(e){}
try{fs.mkdirSync("./STORAGE/ICON/");}catch(e){}
try{fs.mkdirSync("./STORAGE/TEMP/");}catch(e){}

//DB整備
import "./db/InitUser";
import "./db/InitServer";
import "./db/InitRole";
import "./db/InitMessage";
import "./db/initOnlineUsers";
import "./db/InitFile";

const httpServer = createServer(app);
const io:Server = new Server(httpServer, {
  //オプション
  maxHttpBufferSize: 1e8, // 100MBごとの通信を許可
});

//ファイル操作ハンドラインポート
require("./fileHandler/multerHandler")(app);
require("./fileHandler/IconHandler")(app);

//SocketHandlerインポート
require("./socketHandler/Server.ts")(io);
require("./socketHandler/User.ts")(io);
require("./socketHandler/Channel.ts")(io);
require("./socketHandler/auth.ts")(io);
require("./socketHandler/Role.ts")(io);
require("./socketHandler/Message")(io);
require("./socketHandler/OnlineUsers")(io);

//オンラインの接続を削除する用
import removeUserOnlineBySocketId from "./util/onlineUsers/removeUserOnlineBySocketId";

//共通ハンドラ
io.on("connection", (socket:Socket) => {
  console.log("*** 接続検知 ***");

  //ユーザーから切断されたとき
  socket.on("disconnect", async () => {
    //接続を削除
    const userIdDisconnecting = await removeUserOnlineBySocketId(socket.id);
    //ログイン中の全員に切断されたユーザーIdを返す
    if (userIdDisconnecting !== null) {
      io.to("LOGGEDIN").emit("removeOnlineUser", {data:userIdDisconnecting});
    }
  });
});

httpServer.listen(33333, () =>{
  console.log("------ Girack-m-Backend ------");
  console.log("INDEX :: サーバーホスト開始 -> ", 33333);
});
