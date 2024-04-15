import { Socket, Server } from "socket.io";
import IRequestSender from "../type/requestSender";
import checkSession from "../actionHandler/auth/checkSession";
import saveMessage from "../actionHandler/Message/saveMessage";
import fetchHistory from "../actionHandler/Message/fetchHistory";
import reactMessage from "../actionHandler/Message/reactMessage";
import fetchMessage from "../actionHandler/Message/fetchMessage";
import setMessageReadTime from "../actionHandler/Message/setMessageReadId";

import type { IMessage } from "../type/Message";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //ログイン認証
    socket.on("sendMessage", async (
      dat:{
        RequestSender:IRequestSender,
        message: {
          channelId: string,
          content: string
        }
      }
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSING_INFO"|"ERROR_SESSION_ERROR",
        data: IMessage|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::sendMessage", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //メッセージデータを処理
        const messageData = await saveMessage(
          dat.RequestSender.userId,
          dat.message
        );

        //処理に成功したのならメッセージ送信
        if (messageData !== null) {
          io.to(messageData.channelId).emit("receiveMessage", messageData);
        }
      } catch(e) {
        console.log("Message :: socket(sendMessage) : エラー->", e);
      }
    });

    //履歴の取得
    socket.on("fetchHistory", async (
      dat:{
        RequestSender: IRequestSender,
        channelId: string,
        fetchingPosition: {
          positionMessageId: string,
          fetchDirection: "older"|"newer"
        }
      }
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSING_INFO"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING",
        data: IMessage[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchHistory", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //履歴を求める
        const historyData:{
          history: IMessage[],
          atTop: boolean,
          atEnd: boolean
        }|null = await fetchHistory(dat.channelId, dat.fetchingPosition);
        //データを送信
        socket.emit(
          "RESULT::fetchHistory",
          {
            result: "SUCCESS",
            data: {
              channelId: dat.channelId,
              historyData: historyData
            }
          }
        );
      } catch(e) {
        console.log("Message :: socket(fetchHistory) : エラー->", e);
        socket.emit("RESULT::fetchHistory", { result:"ERROR_DB_THING", data:null });
      }
    });

    //リアクション追加処理
    socket.on("reactMessage", async (
      dat: {
        RequestSender: IRequestSender,
        channelId: string,
        messageId: string,
        reactionName: string
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::reactMessage", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //リアクション追加処理、結果受け取り
        const reactResult:boolean = await reactMessage(
          dat.channelId,
          dat.messageId,
          dat.reactionName,
          dat.RequestSender.userId
        );

        //リアクション結果に応じて処理
        if (reactResult) {
          //処理した後のメッセージ取得
          const messageNow = await fetchMessage(dat.channelId, dat.messageId);
          //メッセージが取得できたら成功と送信
          if (messageNow !== null) {
            //更新させる
            io.to(dat.channelId).emit("updateMessage", { result:"SUCCESS", data:messageNow});
            //リアクションしたユーザーへの結果送信
            socket.emit("RESULT::reactMessage", { result:"SUCCESS", data:true});
          } else { //取得がnullならエラーとして送信
            socket.emit("RESULT::reactMessage", { result:"ERROR_DB_THING", data:false});
          }
        } else {
          socket.emit("RESULT::reactMessage", { result:"ERROR_DB_THING", data:false});
        }
      } catch(e) {
        console.log("Message :: socket(reactMessage) : エラー->", e);
        socket.emit("RESULT::reactMessage", { result:"ERROR_DB_THING", data:false});
      }
    });

    //メッセージの最終既読メッセIDを保存する
    socket.on("setMessageReadId", async (
      dat: {
        RequestSender: IRequestSender,
        channelId: string,
        messageId: string
    }) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::setMessageReadId", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //最新既読Id書き込み
        const setMessageReadIdResult:boolean = await setMessageReadTime(
          dat.RequestSender.userId,
          dat.channelId,
          dat.messageId
        );

        //結果に応じてboolを送信
        if (setMessageReadIdResult) {
          socket.emit("RESULT::setMessageReadId", { result:"SUCCESS", data:true});
        } else {
          socket.emit("RESULT::setMessageReadId", { result:"ERROR_DB_THING", data:false});
        }
      } catch(e) {
        console.log("Message :: socket(setMessageReadId) : エラー->", e);
        socket.emit("RESULT::setMessageReadId", { result:"ERROR_DB_thing", data:null });
      }
    });

  });
}
