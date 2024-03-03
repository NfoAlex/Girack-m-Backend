import { Socket, Server } from "socket.io";

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

  });
}
