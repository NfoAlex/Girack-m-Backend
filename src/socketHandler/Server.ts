import type { Socket, Server } from "socket.io";
import { ServerInfo } from "../db/InitServer";
import checkSession from "../actionHandler/auth/checkSession";
import updateServerConfig from "../actionHandler/Server/updateServerConfig";
import roleCheck from "../util/roleCheck";
import updateServerInfo from "../actionHandler/Server/updateServerInfo";
import fetchApiInfo from "../actionHandler/Server/fetchApiInfo";
import fetchAllApiInfo from "../actionHandler/Server/fetchAllApiInfo";
import createApiClient from "../actionHandler/Server/createApiClient";

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
      // biome-ignore lint/performance/noDelete: 完全に削除したいため
      delete ServerInfoLimited.registration.invite.inviteCode;

      //返す
      socket.emit("RESULT::fetchServerInfoLimited", { result:"SUCCESS", data:ServerInfoLimited });
    });

    //全てのインスタンス情報を取得
    socket.on("fetchServerInfoFull", (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSINGROLE",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchServerInfoFull", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      //権限確認
      const roleCheckResult = roleCheck(dat.RequestSender.userId, "ServerManage");
      if (!roleCheckResult) {
        socket.emit("RESULT::fetchServerInfoFull", { result:"ERROR_ROLE", data:null });
        return;
      }

      socket.emit("RESULT::fetchServerInfoFull", { result:"SUCCESS", data:ServerInfo });
    });

    //サーバー設定の更新
    socket.on("updateServerConfig", (dat:{ RequestSender:IRequestSender, ServerConfig:IServerInfo["config"]}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_INTERNAL_ERROR|ERROR_DB_THING|ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::updateServerConfig", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //権限確認
        const roleCheckResult = roleCheck(dat.RequestSender.userId, "ServerManage");
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
          // biome-ignore lint/performance/noDelete: 完全に削除したいため
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
    socket.on("updateServerInfo", (
      dat:{
        RequestSender: IRequestSender,
        servername: IServerInfo["servername"]
        registration: IServerInfo["registration"]
      }
    ) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::updateServerInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //権限確認
        const roleCheckResult = roleCheck(dat.RequestSender.userId, "ServerManage");
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
          // biome-ignore lint/performance/noDelete: 完全に削除したいため
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

    //ユーザーのAPI利用情報を取得
    socket.on("fetchApiInfo", (dat:{RequestSender:IRequestSender}) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchApiInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //API利用情報取得
        const apiClientInfo = fetchApiInfo(dat.RequestSender.userId);
        socket.emit("RESULT::fetchApiInfo", { result:"SUCCESS", data:apiClientInfo });
      } catch(e) {
        console.log("Server :: socket(fetchApiInfo) : エラー->", e);
        socket.emit("RESULT::fetchApiInfo", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //管理者として全員API利用情報を取得
    socket.on("fetchAllApiInfo", (dat:{RequestSender:IRequestSender}) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::fetchAllApiInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //サーバー管理の権限が無かった時はエラー
        if (!roleCheck(dat.RequestSender.userId, "ServerManage")) {
          socket.emit("RESULT::fetchAllApiInfo", { result:"ERROR_MISSING_ROLE", data:null });
          return;
        }

        //API利用情報取得
        const apiClientInfo = fetchAllApiInfo(dat.RequestSender.userId);
        socket.emit("RESULT::fetchAllApiInfo", { result:"SUCCESS", data:apiClientInfo });
      } catch(e) {
        console.log("Server :: socket(fetchAllApiInfo) : エラー->", e);
        socket.emit("RESULT::fetchAllApiInfo", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //API利用情報を作成する
    socket.on("createApiClient", (
      dat: {
        RequestSender: IRequestSender,
        name: string,
        description: string
      }
    ) => {
      /* セッション認証 */
      if (!(checkSession(dat?.RequestSender))) {
        socket.emit("RESULT::createApiClient", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロールを確認する
        if (!roleCheck(dat.RequestSender.userId, "APIUse")) {
          socket.emit("RESULT::createApiClient", { result:"ERROR_ROLE", data:null });
          return;
        }

        //API利用情報作成
        const createResult = createApiClient(
          dat.RequestSender.userId,
          dat.name,
          dat.description
        );
        //結果に応じてそう送信
        if (createResult) {
          socket.emit("RESULT::createApiClient", { result:"SUCCESS", data:null });
        } else {
          socket.emit("RESULT::createApiClient", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        console.log("Server :: socket(createApiClient) : エラー->", e);
        socket.emit("RESULT::createApiClient", { result:"ERROR_INTERNAL_THING", data:false });
      }
    });

  });
}
