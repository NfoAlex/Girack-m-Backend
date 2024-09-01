import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import express from "express";

const remoteApp = express();

const httpServer = createServer(remoteApp);
const remoteIo:Server = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

//共通ハンドラ
remoteIo.on("connection", (socket:Socket) => {
  console.log("REMOTE :: 接続検知");

  //APIからのWS通信が切断されたとき
  socket.on("disconnect", async () => {
    console.log("REMOTE :: API接続が切断されました。")
  });
});

httpServer.listen(33332, () =>{
  console.log("------ Girack-m-Backend - REMOTE ------");
  console.log("REMOTE :: サーバーホスト開始 -> ", 33332);
});
