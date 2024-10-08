import type { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import createChannel from "../actionHandler/Channel/createChannel";
import fetchChannel from "../actionHandler/Channel/fetchChannel";
import fetchChannelList from "../actionHandler/Channel/fetchChannelList";
import joinChannel from "../actionHandler/Channel/joinChannel";
import leaveChannel from "../actionHandler/Channel/leaveChannel";
import roleCheck from "../util/roleCheck";
import deleteChannel from "../actionHandler/Channel/deleteChannel";
import updateChannel from "../actionHandler/Channel/updateChannel";

import type IRequestSender from "../type/requestSender";
import type { IChannel } from "../type/Channel";
import recordSystemMessage from "../util/Message/recordSystemMessage";
import searchChannel from "../actionHandler/Channel/searchChannel";

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
      if (!(checkSession(dat?.RequestSender))) {
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
        const roleCheckResult = roleCheck(dat.RequestSender.userId, "ChannelManage");
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
        //const channelList = await fetchChannelList();
        //io.emit("RESULT::fetchChannelList", { result:"SUCCESS", data:channelList });
      } catch(e) {
        socket.emit("RESULT::createChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネル削除
    socket.on("deleteChannel", (dat:{RequestSender:IRequestSender, channelId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR"|"ERROR_CANNOT_DELETE_RANDOM",
        data: boolean|null
      }
      */

      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::deleteChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //最初のRandomチャンネルは削除できないようにするため
        if (dat.channelId === "0001") {
          socket.emit("RESULT::deleteChannel", { result:"ERROR_CANNOT_DELETE_0001", data:null });
          return;
        }

        //ロール権限を確認する
        const roleCheckResult = roleCheck(dat.RequestSender.userId, "ChannelManage");
        if (!roleCheckResult) { //falseなら停止
          socket.emit("RESULT::deleteChannel", { result:"ERROR_ROLE", data:null });
          return;
        }

        //チャンネルを削除する
        const deleteChannelResult = deleteChannel(
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

    //チャンネルを更新
    socket.on("updateChannel", (
      dat: {
        RequestSender: IRequestSender,
        channelId: string,
        channelInfo: IChannel
      }
    ) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::updateChannel", { result:"ERROR_SESSION_ERROR" });
        return;
      }

      try {
        //チャンネル更新
        const resultChannelUpdate = updateChannel(
          dat.RequestSender.userId,
          dat.channelId,
          dat.channelInfo
        );

        //結果に応じて送信、成功ならチャンネルデータを全員に送信
        if (resultChannelUpdate) {
          //更新操作の操作者にのみ結果を送信
          socket.emit("RESULT::updateChannel", { result:"SUCCESS" });

          //システムメッセを記録する
          const systemMessageAdded = recordSystemMessage(
            null,
            dat.RequestSender.userId,
            {
              channelId: dat.channelId,
              contentFlag: "CHANNEL_INFO_UPDATED"
            }
          );
          //システムメッセージを参加したチャンネルへ配信
          io.to(dat.channelId).emit("receiveMessage", systemMessageAdded);
          
          //チャンネル情報を収集、送信
          const channelInfoUpdated = fetchChannel(dat.channelId, dat.RequestSender.userId);
          if (channelInfoUpdated !== null) {
            io.to("LOGGEDIN").emit("RESULT::fetchChannelInfo", {
              result: "SUCCESS",
              data: {
                channelId: dat.channelId,
                channelInfo: channelInfoUpdated
              }
            });
          }
        } else {
          socket.emit("RESULT::updateChannel", { result:"ERROR_DB_THING" });
          return;
        }
      } catch(e) {
        socket.emit("RESULT::updateChannel", { result:"ERROR_INTERNAL_THING" });
        return;
      }
    });

    //チャンネル情報を取得する
    socket.on("fetchChannelInfo", (dat:{RequestSender:IRequestSender, channelId:string}) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchChannelInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }
      
      try {
        //チャンネル情報取得
        const channelInfo = fetchChannel(dat.channelId, dat.RequestSender.userId);
        //結果送信
        if (channelInfo !== null) {
          socket.emit("RESULT::fetchChannelInfo", {
            result: "SUCCESS",
            data: {
              channelId: dat.channelId,
              channelInfo: channelInfo
            }
          });
        } else {
          socket.emit("RESULT::updateChannel", { result:"ERROR_INTERNAL_THING" });
          return;
        }
      } catch(e) {
        console.log("Channel :: fetchChannelInfo : エラー->", e);
        //エラーを返す
        socket.emit("RESULT::fetchChannelInfo", {
          result: "ERROR_DB_THING",
          data: null
        });
      }
    });

    //チャンネルを検索する
    socket.on("searchChannelInfo", (dat:{RequestSender:IRequestSender, query:string, pageIndex:number}) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::searchChannelInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //チャンネル情報を検索、取得する
        const channelInfos = searchChannel(
          dat.query,
          dat.RequestSender.userId,
          dat.pageIndex
        );

        socket.emit("RESULT::searchChannelInfo", {result:"SUCCESS", data:channelInfos });
      } catch(e) {
        socket.emit("RESULT::searchChannelInfo", {result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //チャンネルを一覧で取得
    socket.on("fetchChannelList", (dat:{RequestSender:IRequestSender}) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchChannelList", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //チャンネルリストを取得
        const channelList = fetchChannelList(dat.RequestSender.userId);
        socket.emit("RESULT::fetchChannelList", { result:"SUCCESS", data:channelList });
      } catch(e) {
        socket.emit("RESULT::fetchChannelList", { result:"ERROR_DB_THING", data:null });
      }
    });

    //チャンネルへ参加
    socket.on("joinChannel", (dat:{ RequestSender:IRequestSender, channelId:string }) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: string|null
      }
      */

      //セッション認証
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::joinChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //参加処理
        const joinChannelResult:boolean = joinChannel(dat.RequestSender.userId, dat.channelId);

        //結果を送信
        if (joinChannelResult) {
          socket.join(dat.channelId); //チャンネル用ルームへ参加させる
          socket.emit("RESULT::joinChannel", { result:"SUCCESS", data:dat.channelId });

          //システムメッセを記録する
          const systemMessageAdded = recordSystemMessage(
            null,
            dat.RequestSender.userId,
            {
              channelId: dat.channelId,
              contentFlag: "CHANNEL_JOINED"
            }
          );
          //システムメッセージを参加したチャンネルへ配信
          io.to(dat.channelId).emit("receiveMessage", systemMessageAdded);
        } else {
          socket.emit("RESULT::joinChannel", { result:"ERROR_DB_THING", data:dat.channelId });
        }
      } catch(e) {
        console.log("channel :: socket(joinChannel) : エラー->", e);
        socket.emit("RESULT::joinChannel", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //チャンネルから脱退
    socket.on("leaveChannel", (dat:{ RequestSender:IRequestSender, channelId:string }) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: boolean|null
      }
      */

      //セッション認証
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::leaveChannel", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //脱退処理
        const leaveChannelResult:boolean = leaveChannel(dat.RequestSender.userId, dat.channelId);

        //結果を送信
        if (leaveChannelResult) {
          socket.leave(dat.channelId); //チャンネル用ルームから退出
          socket.emit("RESULT::leaveChannel", { result:"SUCCESS", data:dat.channelId });

          //システムメッセを記録する
          const systemMessageAdded = recordSystemMessage(
            null,
            dat.RequestSender.userId,
            {
              channelId: dat.channelId,
              contentFlag: "CHANNEL_LEFT"
            }
          );
          //システムメッセージを参加したチャンネルへ配信
          io.to(dat.channelId).emit("receiveMessage", systemMessageAdded);
        } else {
          socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:dat.channelId });
        }
      } catch(e) {
        socket.emit("RESULT::leaveChannel", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
