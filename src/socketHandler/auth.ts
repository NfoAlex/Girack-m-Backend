import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import { IUserInfo } from "../type/User";
import authRegister from "../actionHandler/auth/authRegister";
import IRequestSender from "../type/requestSender";
import changePassword from "../actionHandler/auth/changePassword";
import checkSession from "../actionHandler/auth/checkSession";
import { ServerInfo } from "../db/InitServer";
import fetchUser from "../actionHandler/User/fetchUser";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //ログイン認証
    socket.on("authLogin", async (dat:{username:string, password:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_WRONGINFO",
        data: ServerInfoLimited<IServerInfo>|null
      }
      */

      try {
        //認証処理
        const authData:{
          authResult:boolean,
          UserInfo: IUserInfo|null,
          sessionId: string|null
        } = await authLogin(dat.username, dat.password);

        console.log("auth :: authLogin : authResult->", authData);

        //結果に応じて結果送信
        if (authData.authResult && authData !== null && authData.UserInfo !== null) {
          //参加したチャンネル全部分のSocketルーム参加
          if (authData.UserInfo.channelJoined !== undefined) {
            for (let channelId of authData.UserInfo.channelJoined) {
              socket.join(channelId);
            }
          }
          //成功
          socket.emit("RESULT::authLogin", {
            result:"SUCCESS",
            data:{
              UserInfo: authData.UserInfo,
              sessionId: authData.sessionId
            }
          });
        } else {
          //認証無理だったら
          socket.emit("RESULT::authLogin", { result:"ERROR_WRONGINFO", data:null });
        }
      } catch(e) {
        //認証無理だったら
        socket.emit("RESULT::authLogin", { result:"ERROR_WRONGINFO", data:null });
        console.log("auth :: socket(authLogin) : error->", e);
      }
    });

    //セッションのみでの認証
    socket.on("authSession", async (dat:{userId:string, sessionId:string}) => {
      //セッション確認
      if (!(await checkSession(dat))) { //失敗
        socket.emit("RESULT::authSession", { result:"ERROR_SESSION_ERROR", data:false });
      } else { //成功
        //参加チャンネル分、Socketルームへ参加させる
        const userInfo = await fetchUser(dat.userId, null);
          //情報が空じゃなければ参加処理
        if (userInfo !== null) {
          //参加ァ
          for (let channelId of userInfo.channelJoined) {
            socket.join(channelId);
          }
        }
        socket.emit("RESULT::authSession", { result:"SUCCESS", data:true });
      }
    });

    //新規登録
    socket.on("authRegister", async (dat:{username:string, inviteCode:string|null}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING|"ERROR_WRONGINVITECODE"|"ERROR_REGISTER_DISABLED",
        data: {datUser:IUserInfo, password:string}|null
      }
      */

      //登録処理
      try {
        //登録がそもそも無効化ならエラーを返して停止
        if (!ServerInfo.registration.available) {
          socket.emit("RESULT::authRegister", { result:"ERROR_REGISTER_DISABLED", data:null });
          return;
        }

        //登録、結果格納
        const datUserResult:{
          userInfo:IUserInfo,
          password:string
        }|"ERROR_WRONGINVITECODE"|"ERROR_DB_THING" =
          await authRegister(dat.username, dat.inviteCode);

        //エラー文ならそう返す
        if (datUserResult === "ERROR_WRONGINVITECODE" || datUserResult === "ERROR_DB_THING") {
          socket.emit("RESULT::authRegister", { result:datUserResult, data:null });
        } else {
          socket.emit("RESULT::authRegister", { result:"SUCCESS", data:datUserResult });
        }

        //console.log("auth :: authRegister : dat->", datUserResult);
      }
      catch (e) {
        socket.emit("RESULT::authRegister", { result:"ERROR_DB_THING", data:null });
        console.log("auth :: socket(authRegister) : error->", e);
      }
    });

    //パスワード変更
    socket.on("changePassword", async (
      dat:{RequestSender:IRequestSender, currentPassword:string, newPassword:string}
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING|"ERROR_WRONGPASSWORD"|"ERROR_SESSION_ERROR",
        data: null
      }
      */
     
      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::changePassword", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //パスワードを変更し結果を受け取る
        const changePasswordResult = 
          await changePassword(
            dat.RequestSender.userId,
            dat.currentPassword,
            dat.newPassword
          );
          
        //結果を返すだけ
        if (changePasswordResult) {
          socket.emit("RESULT::changePassword", { result:"SUCCESS", data:null });
        } else {
          socket.emit("RESULT::changePassword", { result:"ERROR_WRONGPASSWORD", data:null });
        }
      } catch(e) {
        socket.emit("RESULT::changePassword", { result:"ERROR_SESSION_ERROR", data:null });
      }
    });

  });
}
