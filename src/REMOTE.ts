import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import io from "socket.io-client"
import express from "express";
import type IRequestSender from "./type/requestSender";

const remoteApp = express();

const httpServer = createServer(remoteApp);
const remoteIo:Server = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

//メインサーバーへ接続するためのWS通信
const socketClient = io('http://localhost:33333', {
  reconnectionDelayMax: 5000,
  transports: ['websocket']
});

socketClient.on("connect", () => {
  console.log("REMOTE :: サーバーへ接続された");
});

//エラー表示用
socketClient.io.on("error", (e) => {
  if (e.stack?.startsWith("Error: websocket error")) {
    console.error("メインサーバーが見つかりませんでした...再接続しています")
  } else {
    console.error("REMOTE :: エラー->", e);
  }
});

//APIサーバーとしての共通ハンドラ
remoteIo.on("connection", (socket:Socket) => {
  console.log("REMOTE :: 接続検知");

  //シグナル名を取得する
  socket.onAny((eventName: string, dat:{RequestSender:IRequestSender}, callback) => {
    console.log(
      "remoteIo :: onAny : eventName->",
      eventName,
      " dat->", dat,
      " callback->", callback
    );

    //コールバック関数で返答するかどうか変数
    let useCallback = false;
    if (callback !== undefined) useCallback = true;

    //返信用関数
    const answer = (data?:any) => {
      !useCallback ? 
        socket.emit(`RESULT::${eventName}`, { ...data })
        :
        callback({ ...data })
    };

    if (dat === null) {
      answer("ERROR_REQUESTSENDER_IS_UNDEFINED");
      return;
    }

    //送信者情報がないならエラー
    if (!("RequestSender" in dat)) {
      answer("ERROR_REQUESTSENDER_IS_UNDEFINED")
      return;
    }

    //または送信者情報が無効な形式ならエラー
    if (
      typeof(dat.RequestSender.sessionId) !== "string"
      ||
      typeof(dat.RequestSender.userId) !== "string"
    ) {
      answer("ERROR_REQUESTSENDER_IS_INVALID");
      return;
    }

    //API用のセッションIdでないならエラー
    if (!dat.RequestSender.sessionId.startsWith("api_")) {
      answer("ERROR_SESSIONID_IS_NOT_FOR_API");
      return;
    }

    //結果受け取り用
    socketClient.on(`RESULT::${eventName}`, (dat:any) => {
      console.log("remoteIo :: data処理結果->", dat);
      answer(dat);
    });
    //メインサーバーへ送信、受取
    socketClient.emit(eventName, dat);
  });

  //APIからのWS通信が切断されたとき
  socket.on("disconnect", async () => {
    console.log("REMOTE :: API接続が切断されました。")
  });
});

httpServer.listen(33332, () =>{
  console.log("------ Girack-m-Backend - REMOTE ------");
  console.log("REMOTE :: サーバーホスト開始 -> ", 33332);
});
