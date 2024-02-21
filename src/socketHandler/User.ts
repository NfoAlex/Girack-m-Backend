import { Socket, Server } from "socket.io";
import fetchUserConfig from "../actionHandler/fetchInfo/fetchUserConfig";
import checkSession from "../actionHandler/auth/checkSession";

import type IRequestSender from "../type/requestSender";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //ユーザーの設定データを取得
    socket.on("fetchUserConfig", async (RequestSender:IRequestSender) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* TODO :: セッション認証 */
      if (!(await checkSession(RequestSender.userId, RequestSender.sessionId))) {
        socket.emit("RESULTfetchUserConfig", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        const configData = await fetchUserConfig(RequestSender.userId);
        
        console.log("fetchInfo :: socket(fetchUserConfig) : configData ->", configData);

        //返す
        socket.emit("RESULTfetchUserConfig", { result:"SUCCESS", data:configData });
      } catch(e) {
        //返す
        socket.emit("RESULTfetchUserConfig", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
