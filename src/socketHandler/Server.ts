import type { Socket, Server } from "socket.io";
import { ServerInfo } from "../db/InitServer";
import checkSession from "../actionHandler/auth/checkSession";
import updateServerConfig from "../actionHandler/Server/updateServerConfig";
import roleCheck from "../util/roleCheck";
import updateServerInfo from "../actionHandler/Server/updateServerInfo";

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
      socket.emit("RESULT::fetchServerInfoLimited", { result:"SUCCESS", data:ServerInfoLimited });
    });

    //全てのインスタンス情報を取得
    socket.on("fetchServerInfoFull", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSINGROLE",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchServerInfoFull", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      //権限確認
      const roleCheckResult = await roleCheck(dat.RequestSender.userId, "ServerManage");
      if (!roleCheckResult) {
        socket.emit("RESULT::fetchServerInfoFull", { result:"ERROR_ROLE", data:null });
        return;
      }

      socket.emit("RESULT::fetchServerInfoFull", { result:"SUCCESS", data:ServerInfo });
    });

    //サーバー設定の更新
    socket.on("updateServerConfig", async (dat:{ RequestSender:IRequestSender, ServerConfig:IServerInfo["config"]}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_INTERNAL_ERROR|ERROR_DB_THING|ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::updateServerConfig", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //権限確認
        const roleCheckResult = await roleCheck(dat.RequestSender.userId, "ServerManage");
        if (!roleCheckResult) {
          socket.emit("RESULT::updateServerConfig", { result:"ERROR_ROLE", data:null });
          return;
        }

        //更新処理
        const updateServerConfigResult = updateServerConfig(dat.ServerConfig);
        //結果に応じてそれを送信
        if (updateServerConfigResult) {
          socket.emit("RESULT::updateServerConfig", { result:"SUCCESS", data:true });

          //転送するインスタンス情報を削るためにクローンする
          const ServerInfoLimited:IServerInfo = structuredClone(ServerInfo);
          //招待コードを削除
          delete ServerInfoLimited.registration.invite.inviteCode;
          //サーバー情報を返す
          io.emit("RESULT::fetchServerInfoLimited", { result:"SUCCESS", data:ServerInfoLimited });
        } else {
          socket.emit("RESULT::updateServerConfig", { result:"ERROR_INTERNAL_ERROR", data:false });
        }
      } catch(e) {
        socket.emit("RESULT::updateServerConfig", { result:"ERROR_DB_THING", data:null });
      }
    });

    //インスタンスの基本情報の更新
    socket.on("updateServerInfo", async (
      dat:{
        RequestSender: IRequestSender,
        servername: IServerInfo["servername"]
        registration: IServerInfo["registration"]
      }
    ) => {
      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::updateServerInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //権限確認
        const roleCheckResult = await roleCheck(dat.RequestSender.userId, "ServerManage");
        if (!roleCheckResult) {
          socket.emit("RESULT::updateServerInfo", { result:"ERROR_ROLE", data:null });
          return;
        }

        //更新処理
        const updateServerInfoResult:boolean = updateServerInfo(dat.servername, dat.registration);
        //もし成功なら現在のサーバー情報を返す
        if (updateServerInfoResult) {
          //転送するインスタンス情報を削るためにクローンする
          const ServerInfoLimited:IServerInfo = structuredClone(ServerInfo);
          //招待コードを削除
          delete ServerInfoLimited.registration.invite.inviteCode;
          
          //全員にサーバー情報を返す
          io.emit("RESULT::fetchServerInfoLimited", { result:"SUCCESS", data:ServerInfoLimited });
          //サーバー情報編集者にすべてのサーバー情報を返す
          socket.emit("RESULT::fetchServerInfoFull", { result:"SUCCESS", data:ServerInfo });
        } else {
          socket.emit("RESULT::updateServerInfo", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        socket.emit("RESULT::updateServerInfo", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
