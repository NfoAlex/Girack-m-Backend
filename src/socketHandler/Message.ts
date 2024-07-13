import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import saveMessage from "../actionHandler/Message/saveMessage";
import fetchHistory from "../actionHandler/Message/fetchHistory";
import reactMessage from "../actionHandler/Message/reactMessage";
import fetchMessage from "../actionHandler/Message/fetchMessage";
import setMessageReadTime from "../actionHandler/Message/setMessageReadTime";
import getMessageReadTime from "../actionHandler/Message/getMessageReadTime";
import deleteMessage from "../actionHandler/Message/deleteMessage";
import genLinkPreview from "../util/genLinkPreview";

import type IRequestSender from "../type/requestSender";
import type { IMessage, IMessageReadTime } from "../type/Message";
import editMessage from "../actionHandler/Message/editMessage";

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

        //console.log("Message :: socket(sendMessage) : messageData->", messageData);

        //処理に成功したのならメッセージ送信
        if (messageData !== null) {
          //送信
          io.to(messageData.messageResult.channelId).emit("receiveMessage", messageData.messageResult);
          //メンション先のユーザーへ通知を送信
          if (messageData.userIdMentioning) { //nullじゃなければ送る
            for (let userId of messageData.userIdMentioning) {
              io.to(userId).emit("newNotification");
            }
          }

          /**************************************************/
          /* URLがあったときのプレビュー生成、送信 */

          //URLが含まれるならプレビューを生成
          const urlRegex = /((https|http)?:\/\/[^\s]+)/g;
          const urlMatched = messageData.messageResult.content.match(urlRegex);
            //nullじゃなければ生成
          if (urlMatched) {
            const linkDataResult:IMessage["linkData"]|null = await genLinkPreview(
              urlMatched,
              messageData.messageResult.channelId,
              messageData.messageResult.messageId
            );

            //結果があるなら更新させる
            if (linkDataResult !== null) {
              //リンクデータを上書き
              messageData.messageResult.linkData = linkDataResult;
              //送信
              io.to(messageData.messageResult.channelId).emit(
                "updateMessage",
                {
                  result: "SUCCESS",
                  data: messageData.messageResult
                }
              );
            } else {
              console.log("Message :: socket(sendMessage) : URL結果がnull");
              return;
            }
          }
          
          /**************************************************/
        }
      } catch(e) {
        console.log("Message :: socket(sendMessage) : エラー->", e);
      }
    });

    //メッセージの削除
    socket.on("deleteMessage", async (
      dat: {
        RequestSender: IRequestSender
        channelId: string,
        messageId: string
      }
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSING_INFO"|"ERROR_SESSION_ERROR",
        data: messageId|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::deleteMessage", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //削除処理
        const deleteMessageResult = await deleteMessage(
          dat.channelId,
          dat.messageId,
          dat.RequestSender.userId
        );

        //結果に応じて送信
        if (deleteMessageResult) {
          io.to(dat.channelId).emit("RESULT::deleteMessage", {
            result: "SUCCESS",
            data: {
              channelId: dat.channelId,
              messageId: dat.messageId
            }
          });
          return;
        } else {
          socket.emit("RESULT::deleteMessage", { result:"ERROR_DB_THING", data:null });
          return;
        }
      } catch(e) {
        console.log("socket(Message) :: deleteMessage : エラー->", e);
        return;
      }
    });

    //メッセージの編集
    socket.on("editMessage", async (
      dat:{
        RequestSender: IRequestSender,
        channelId: string,
        messageId: string,
        contentUpdating: string,
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::editMessage", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        const msgEditResult = await editMessage(
          dat.channelId,
          dat.messageId,
          dat.contentUpdating,
          dat.RequestSender.userId
        );

        //結果に応じてデータを送信
        if (msgEditResult) {
          socket.emit(
            "RESULT::editMessage",
            { 
              result: "SUCCESS",
              data: {
                channelId: dat.contentUpdating,
                messageId: dat.messageId,
                content: dat.contentUpdating
              }
            }
          );
        } else {
          socket.emit("RESULT::editMessage", { result:"ERROR_DB_THING", data:null });
          return;
        }
      } catch(e) {
        socket.emit("RESULT::editMessage", { result:"ERROR_INTERNAL_THING", data:null });
        return;
      }
    })

    //履歴の取得
    socket.on("fetchHistory", async (
      dat: {
        RequestSender: IRequestSender,
        channelId: string,
        fetchingPosition: {
          positionMessageId?: string,
          positionMessageTime?: string,
          includeThisPosition: boolean,
          fetchDirection: "older"|"newer",
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

    //メッセージの最終既読メッセ時間を保存する
    socket.on("setMessageReadTime", async (
      dat: {
        RequestSender: IRequestSender,
        channelId: string,
        messageTime: string
    }) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::setMessageReadTime", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //もし時間の値がDate型に使えないならエラーとして返す
        if (isNaN(new Date(dat.messageTime).valueOf())) {
          socket.emit("RESULT::setMessageReadTime", { result:"ERROR_TIME_CANNOT_VALIDATE", data:null });
          return;
        }

        //最新既読時間書き込み
        const setMessageReadTimeResult:boolean = await setMessageReadTime(
          dat.RequestSender.userId,
          dat.channelId,
          dat.messageTime
        );

        //結果に応じてboolを送信
        if (setMessageReadTimeResult) {
          socket.emit("RESULT::setMessageReadTime", { result:"SUCCESS", data:true});
        } else {
          socket.emit("RESULT::setMessageReadTime", { result:"ERROR_DB_THING", data:false});
        }
      } catch(e) {
        console.log("Message :: socket(setMessageReadTime) : エラー->", e);
        socket.emit("RESULT::setMessageReadTime", { result:"ERROR_DB_thing", data:null });
      }
    });

    //チャンネルの既読時間を取得
    socket.on("getMessageReadTime", async (
      dat: {
        RequestSender: IRequestSender
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::getMessageReadTime", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //既読状態取得
        const getMessageReadTimeResult:IMessageReadTime|null = await getMessageReadTime(dat.RequestSender.userId);

        //nullじゃないならデータを送信
        if (getMessageReadTimeResult !== null) {
          socket.emit("RESULT::getMessageReadTime", { result:"SUCCESS", data:getMessageReadTimeResult });
        } else {
          socket.emit("RESULT::getMessageReadTime", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        socket.emit("RESULT::getMessageReadTime", { result:"ERROR_DB_THING", data:null });
        console.log("Message :: socket(getMessageReadTime) : エラー->", e);
      }
    });

  });
}
