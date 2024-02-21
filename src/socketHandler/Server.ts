import { Socket, Server } from "socket.io";
import { ServerInfo } from "../db/InitServer";

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

  });
}
