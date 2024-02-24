import { Socket, Server } from "socket.io";
import fetchUserConfig from "../actionHandler/User/fetchUserConfig";
import changeUserName from "../actionHandler/User/changeUserName";
import checkSession from "../actionHandler/auth/checkSession";

import type IRequestSender from "../type/requestSender";
import fetchUser from "../db/fetchUser";
import type { IUserInfo, IUserInfoPublic } from "../type/User";
import searchUser from "../db/searchUser";

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
        const userInfo:IUserInfo[] = await fetchUser(dat.RequestSender.userId, null);
        
        //一旦ユーザー情報をクローンしてパスワードを削除
        //型はIUserInfoPublic
        let userInfoSingle:any = structuredClone(userInfo[0]);
        delete userInfoSingle.password;

        socket.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfoSingle });
      } catch(e) {
        socket.emit("RESULT::fetchUserInfo", { result:"ERROR_DB_THING", data:null });
      }

    });

    //ユーザー名で検索して一括取得
    socket.on("searchUserInfo", async (dat:{RequestSender:IRequestSender, userName:string, rule:"FULL"|"PARTIAL"}) => {
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
        //変更
        await changeUserName(dat.RequestSender.userId, dat.userName);

        socket.emit("RESULT::changeUserName", { result:"SUCCESS", data:null });
      } catch(e) {
        socket.emit("RESULT::changeUserName", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
