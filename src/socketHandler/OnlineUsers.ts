import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import { IUserInfo } from "../type/User";
import addUserOnline from "../util/onlineUsers/addUserOnline";
import fetchOnlineUsers from "../actionHandler/onlineUsers/fetchOnlineUsers";
import IRequestSender from "../type/requestSender";
import checkSession from "../actionHandler/auth/checkSession";

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
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchOnlineUsers", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //認証処理
        const onlineUsers = await fetchOnlineUsers();

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
