import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import createChannel from "../actionHandler/Channel/createChannel";
import fetchChannel from "../actionHandler/Channel/fetchChannel";
import fetchChannelList from "../actionHandler/Channel/fetchChannelList";
import joinChannel from "../actionHandler/Channel/joinChannel";
import leaveChannel from "../actionHandler/Channel/leaveChannel";
import roleCheck from "../util/roleCheck";
import deleteChannel from "../actionHandler/Channel/deleteChannel";

import type IRequestSender from "../type/requestSender";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //チャンネル作成
    socket.on("createChannel", async (dat:
      {
        RequestSender:IRequestSender,
        channelName:string,
        description:string,
        isPrivate:boolean,
      }
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_ROLE"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_CHANNELNAME_BLANK",
        data: createChannelResult<boolean>|null
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::createChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //チャンネル名が空ならエラーを返して終了
        if (dat.channelName.length === 0 ) {
          socket.emit("RESULT::createChannel", { result:"ERROR_CHANNELNAME_BLANK", data:null });
          return;
        }

        //ロール権限を確認する
        const roleCheckResult = await roleCheck(dat.RequestSender.userId, "ChannelCreateAndDelete");
        if (!roleCheckResult) {
          socket.emit("RESULT::createChannel", { result:"ERROR_ROLE", data:null });
          return;
        }

        //チャンネルを作成する
        const createChannelResult = await createChannel(
          dat.channelName,
          dat.description,
          dat.isPrivate,
          dat.RequestSender.userId,
        );

        //返す
        socket.emit("RESULT::createChannel", { result:"SUCCESS", data:createChannelResult });

        //最新のチャンネル情報を全員に送る
        const channelList = await fetchChannelList();
        io.emit("RESULT::fetchChannelList", { result:"SUCCESS", data:channelList });
      } catch(e) {
        socket.emit("RESULT::createChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネル削除
    socket.on("deleteChannel", async (dat:{RequestSender:IRequestSender, channelId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR"|"ERROR_CANNOT_DELETE_RANDOM",
        data: boolean|null
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::deleteChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //Randomチャンネルは削除できないようにするため
        if (dat.channelId === "0001") {
          socket.emit("RESULT::deleteChannel", { result:"ERROR_CANNOT_DELETE_RANDOM", data:null });
          return;
        }

        //ロール権限を確認する
        const roleCheckResult = await roleCheck(dat.RequestSender.userId, "ChannelCreateAndDelete");
        if (!roleCheckResult) { //falseなら停止
          socket.emit("RESULT::deleteChannel", { result:"ERROR_ROLE", data:null });
          return;
        }

        //チャンネルを削除する
        const deleteChannelResult = await deleteChannel(
          dat.RequestSender.userId,
          dat.channelId,
        );

        //結果に応じて削除したチャンネルIDを返す
        if (deleteChannelResult) {
          //チャンネルIDを全員に送信する
          io.emit("RESULT::deleteChannel", { result:"SUCCESS", data:dat.channelId });
        } else {
          //操作者に対してのみ失敗と送信
          socket.emit("RESULT::deleteChannel", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        socket.emit("RESULT::deleteChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネル情報を取得する
    socket.on("fetchChannelInfo", async (dat:{RequestSender:IRequestSender, channelId:string}) => {
      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchChannelInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }
      
      try {
        //チャンネル情報取得
        const channelInfo = await fetchChannel(dat.channelId);
        //結果送信
        socket.emit("RESULT::fetchChannelInfo", {
          result: "SUCCESS",
          data: {
            channelId: dat.channelId,
            channelInfo: channelInfo
          }
        });
      } catch(e) {
        console.log("Channel :: fetchChannelInfo : エラー->", e);
        //エラーを返す
        socket.emit("RESULT::fetchChannelInfo", {
          result: "ERROR_DB_THING",
          data: null
        });
      }
    });

    //チャンネルを一覧で取得
    socket.on("fetchChannelList", async (dat:{RequestSender:IRequestSender}) => {
      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchChannelList", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        const channelList = await fetchChannelList();
        socket.emit("RESULT::fetchChannelList", { result:"SUCCESS", data:channelList });
      } catch(e) {
        socket.emit("RESULT::fetchChannelList", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネルへ参加
    socket.on("joinChannel", async (dat:{ RequestSender:IRequestSender, channelId:string }) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: string|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::joinChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //参加処理
        const joinChannelResult:boolean = await joinChannel(dat.RequestSender.userId, dat.channelId);

        //結果を送信
        if (joinChannelResult) {
          socket.join(dat.channelId); //チャンネル用ルームへ参加させる
          socket.emit("RESULT::joinChannel", { result:"SUCCESS", data:dat.channelId });
        } else {
          socket.emit("RESULT::joinChannel", { result:"ERROR_DB_THING", data:dat.channelId });
        }
      } catch(e) {
        socket.emit("RESULT::joinChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネルから脱退
    socket.on("leaveChannel", async (dat:{ RequestSender:IRequestSender, channelId:string }) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: boolean|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::leaveChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //脱退処理
        const leaveChannelResult:boolean = await leaveChannel(dat.RequestSender.userId, dat.channelId);

        //結果を送信
        if (leaveChannelResult) {
          socket.leave(dat.channelId); //チャンネル用ルームから退出
          socket.emit("RESULT::leaveChannel", { result:"SUCCESS", data:dat.channelId });
        } else {
          socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:dat.channelId });
        }
      } catch(e) {
        socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
