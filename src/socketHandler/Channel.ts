import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import createChannel from "../actionHandler/Channel/createChannel";
import fetchChannel from "../actionHandler/Channel/fetchChannel";
import fetchChannelList from "../actionHandler/Channel/fetchChannelList";

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
        result: "SUCCESS",
        data: null
      }
      */

      try {
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

  });
}
