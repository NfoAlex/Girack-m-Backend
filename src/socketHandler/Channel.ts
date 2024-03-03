import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";
import fetchChannel from "../db/fetchChannel";
import fetchChannelList from "../actionHandler/Channel/fetchChannelList";

import type IRequestSender from "../type/requestSender";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //基本インスタンス情報(招待コードなど省く)を取得
    socket.on("createChannel", ({RequestSender:IRequestSender, channelName:) => {
      /*
      返し : {
        result: "SUCCESS",
        data: null
      }
      */

      

      //返す
      socket.emit("RESULT::createChannel", { result:"SUCCESS", data:null });
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
