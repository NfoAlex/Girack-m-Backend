import { Socket, Server } from "socket.io";
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

    socket.on("fetchChannelList", (dat:{RequestSender:IRequestSender}) => {
      try {
        const channelList = fetchChannelList();
        socket.emit("RESULT::fetchChannelList", {result:"SUCCESS", data:channelList});
      } catch(e) {
        socket.emit("RESULT::fetchChannelList", {result:"ERROR_DB_THING", data:null});
      }
    });

  });
}
