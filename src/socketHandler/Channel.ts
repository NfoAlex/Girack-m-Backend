import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import createChannel from "../actionHandler/Channel/createChannel";
import fetchChannel from "../actionHandler/Channel/fetchChannel";
import fetchChannelList from "../actionHandler/Channel/fetchChannelList";
import joinChannel from "../actionHandler/Channel/joinChannel";
import leaveChannel from "../actionHandler/Channel/leaveChannel";
import { roleCheck } from "../util/roleCheck";

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
      } catch(e) {
        socket.emit("RESULT::createChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネル情報を取得する
    socket.on("fetchChannelInfo", async (dat:{RequestSender:IRequestSender, channelId:string}) => {
      const channelInfo = await fetchChannel(dat.channelId);
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
        socket.emit("RESULT::fetchChannelList", {result:"SUCCESS", data:channelList});
      } catch(e) {
        socket.emit("RESULT::fetchChannelList", {result:"ERROR_DB_THING", data:null});
      }
    });

    //チャンネルへ参加
    socket.on("joinChannel", async (dat:{RequestSender:IRequestSender, channelId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: boolean|null
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
          socket.emit("RESULT::joinChannel", { result:"SUCCESS", data:joinChannelResult });
        } else {
          socket.emit("RESULT::joinChannel", { result:"ERROR_DB_THING", data:joinChannelResult });
        }
      } catch(e) {
        socket.emit("RESULT::joinChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネルから脱退
    socket.on("leaveChannel", async (dat:{RequestSender:IRequestSender, channelId:string}) => {
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
          socket.emit("RESULT::leaveChannel", { result:"SUCCESS", data:leaveChannelResult });
        } else {
          socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:leaveChannelResult });
        }
      } catch(e) {
        socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
