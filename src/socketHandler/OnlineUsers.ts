import type { Socket, Server } from "socket.io";

import fetchOnlineUsers from "../actionHandler/onlineUsers/fetchOnlineUsers";
import checkSession from "../actionHandler/auth/checkSession";

import type IRequestSender from "../type/requestSender";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //オンラインユーザーを取得
    socket.on("fetchOnlineUsers", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_WRONGINFO",
        data: userId[]
      }
      */

      //セッション認証
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchOnlineUsers", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //認証処理
        const onlineUsers = fetchOnlineUsers();

        //console.log("onlineUsers :: fetchOnlineUsers : onlineUsers->", onlineUsers);

        //成功
        socket.emit("RESULT::fetchOnlineUsers", {
          result:"SUCCESS",
          data: onlineUsers
        });
      } catch(e) {
        //認証無理だったら
        socket.emit("RESULT::fetchOnlineUsers", { result:"ERROR_DB_THING", data:null });
        console.log("onlineUsers :: socket(fetchOnlineUsers) : error->", e);
      }
    });

  });
}
