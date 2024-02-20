import { Socket, Server } from "socket.io";
import checkDataIntegrality from "../util/checkDataIntegrality";
import { ServerInfo } from "../db/InitServer";
import fetchUserConfig from "../actionHandler/fetchInfo/fetchUserConfig";
import checkSession from "../actionHandler/auth/checkSession";

import type IServerInfo from "../type/Server";
import type IRequestSender from "../type/requestSender";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //基本インスタンス情報(招待コードなど省く)を取得
    socket.on("fetchServerInfoLimited", () => {
      /*
      返し : {
        result: "SUCCESS",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      //転送するインスタンス情報を削るためにクローンする
      const ServerInfoLimited:IServerInfo = structuredClone(ServerInfo);
      //招待コードを削除
      delete ServerInfoLimited.registration.invite.inviteCode;

      //返す
      socket.emit("RESULTfetchServerInfoLimited", { result:"SUCCESS", data:ServerInfoLimited });
    });

    //全てのインスタンス情報を取得
    socket.on("fetchServerInfoFull", (RequestSender:IRequestSender) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSINGROLE",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* ...ToDo :: 権限チェック */

      socket.emit("RESULTfetchServerInfoFull", { result:"SUCCESS", data:ServerInfo });
    });

    //ユーザーの設定データを取得
    socket.on("fetchUserConfig", async (RequestSender:IRequestSender) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* TODO :: セッション認証 */
      if (await checkSession(RequestSender.userId, RequestSender.sessionId)) {
        socket.emit("RESULTfetchUserConfig", { result:"ERROR_SESSION_ERROR", data:null });
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
