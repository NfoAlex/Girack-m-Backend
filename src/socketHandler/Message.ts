import { Socket, Server } from "socket.io";
import IRequestSender from "../type/requestSender";
import checkSession from "../actionHandler/auth/checkSession";
import saveMessage from "../actionHandler/Message/saveMessage";
import fetchHistory from "../actionHandler/Message/fetchHistory";
import { IMessage } from "../type/Message";

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

  });
}
