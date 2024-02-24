import { Socket, Server } from "socket.io";
import fetchUserConfig from "../actionHandler/User/fetchUserConfig";
import changeUserName from "../actionHandler/User/changeUserName";
import checkSession from "../actionHandler/auth/checkSession";
import fetchUser from "../db/fetchUser";
import searchUser from "../db/searchUser";

import type IRequestSender from "../type/requestSender";
import type { IUserInfo, IUserInfoPublic } from "../type/User";

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

    //一人分のユーザー情報取得(ユーザーIDから)
    socket.on("fetchUserInfo", async (dat:{RequestSender:IRequestSender, userId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: {UserInfo:IUserInfoPublic, UserSession:IUserSession}|null
      }
      */
      //セッション確認
      if (!(await checkSession(dat.RequestSender.userId, dat.RequestSender.sessionId))) {
        socket.emit("RESULT::fetchUserInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        const userInfo = await fetchUser(dat.RequestSender.userId, null, true);
        socket.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
      } catch(e) {
        socket.emit("RESULT::fetchUserInfo", { result:"ERROR_DB_THING", data:null });
      }

    });

    //ユーザー名で検索して一括取得
    socket.on("searchUserInfo", async (
      dat:{RequestSender:IRequestSender, userName:string, rule:"FULL"|"PARTIAL"}
    ) => {
      console.log("User :: searchUserInfo : data->", dat);
      //セッション確認
      if (!(await checkSession(dat.RequestSender.userId, dat.RequestSender.sessionId))) {
        socket.emit("RESULT::searchUserInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //情報検索、取得
        const userInfos = await searchUser(dat.userName, dat.rule);

        socket.emit("RESULT::searchUserInfo", { result:"SUCCESS", data:userInfos })
      } catch(e) {
        socket.emit("RESULT::searchUserInfo", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザー名の変更
    socket.on("changeUserName", async (dat:{RequestSender:IRequestSender, userName:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: null
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender.userId, dat.RequestSender.sessionId))) {
        socket.emit("RESULT::changeUserName", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ユーザー名を変更
        await changeUserName(dat.RequestSender.userId, dat.userName);
        socket.emit("RESULT::changeUserName", { result:"SUCCESS", data:null });
        //現在のユーザー情報を取得して送信
        const userInfo = await fetchUser(dat.RequestSender.userId, null, true);
        io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
      } catch(e) {
        socket.emit("RESULT::changeUserName", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
