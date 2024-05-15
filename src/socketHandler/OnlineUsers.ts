import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import { IUserInfo } from "../type/User";
import addUserOnline from "../util/onlineUsers/addUserOnline";
import fetchOnlineUsers from "../actionHandler/onlineUsers/fetchOnlineUsers";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //オンラインユーザーを取得
    socket.on("fetchOnlineUsers", async (dat:{username:string, password:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_WRONGINFO",
        data: ServerInfoLimited<IServerInfo>|null
      }
      */

      try {
        //認証処理
        const onlineUsers = await fetchOnlineUsers();

        console.log("onlineUsers :: fetchOnlineUsers : onlineUsers->", onlineUsers);

        //結果に応じて結果送信
        

        //オンラインのユーザーとして記録
        await addUserOnline(socket.id, authData.UserInfo.userId, authData.sessionId);

        //成功
        socket.emit("RESULT::fetchOnlineUsers", {
            result:"SUCCESS",
            data:{
                UserInfo: authData.UserInfo,
                sessionId: authData.sessionId
            }
        });
        socket.emit("RESULT::fetchOnlineUsers", { result:"ERROR_WRONGINFO", data:null });

      } catch(e) {
        //認証無理だったら
        socket.emit("RESULT::fetchOnlineUsers", { result:"ERROR_DB_THING", data:null });
        console.log("onlineUsers :: socket(fetchOnlineUsers) : error->", e);
      }
    });

  });
}
