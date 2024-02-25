import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import { IUserInfo } from "../type/User";
import authRegister from "../actionHandler/auth/authRegister";
import IRequestSender from "../type/requestSender";
import changePassword from "../actionHandler/auth/changePassword";
import checkSession from "../actionHandler/auth/checkSession";

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
        if (authData.authResult) {
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
          socket.emit("RESULT::authLogin", {result:"ERROR_WRONGINFO", data:null});
        }
      } catch(e) {
        //認証無理だったら
        socket.emit("RESULT::authLogin", {result:"ERROR_WRONGINFO", data:null});
        console.log("auth :: socket(authLogin) : error->", e);
      }
    });

    //新規登録
    socket.on("authRegister", async (dat:{username:string, inviteCode:string|null}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING|"ERROR_WRONGINVITECODE",
        data: datUser<IUserInfo>|null
      }
      */

      //登録処理
      try {
        const datUser = await authRegister(dat.username, dat.inviteCode);

        //エラー文ならそう返す
        if (datUser === "ERROR_WRONGINVITECODE") {
          socket.emit("RESULT::authRegister", {result:"ERROR_WRONGINVITECODE", data:null});
        } else {
          socket.emit("RESULT::authRegister", {result:"SUCCESS", data:datUser});
        }

        console.log("auth :: authRegister : dat->", datUser);
      }
      catch (e) {
        socket.emit("RESULT::authRegister", {result:"ERROR_DB_THING", data:null});
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
      if (!(await checkSession(dat.RequestSender.userId, dat.RequestSender.sessionId))) {
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
