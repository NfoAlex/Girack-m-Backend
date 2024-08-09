import type { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import authRegister from "../actionHandler/auth/authRegister";
import changePassword from "../actionHandler/auth/changePassword";
import checkSession from "../actionHandler/auth/checkSession";
import fetchSession from "../actionHandler/auth/fetchSession";
import { ServerInfo } from "../db/InitServer";
import fetchUser from "../actionHandler/User/fetchUser";
import addUserOnline from "../util/onlineUsers/addUserOnline";

import type IRequestSender from "../type/requestSender";
import type { IUserInfo } from "../type/User";

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
        if (
          authData.authResult
            &&
          authData !== null
            &&
          authData.UserInfo !== null
            &&
          authData.sessionId !== null
        ) {
          //参加したチャンネル全部分のSocketルーム参加
          if (authData.UserInfo.channelJoined !== undefined) {
            for (let channelId of authData.UserInfo.channelJoined) {
              socket.join(channelId);
            }
          }
          //認証済みの人として参加
          socket.join("LOGGEDIN");
          //このユーザーIdのチャンネルへ参加
          socket.join(authData.UserInfo.userId);

          //オンラインのユーザーとして記録
          const addUserOnlineResult = await addUserOnline(socket.id, authData.UserInfo.userId, authData.sessionId);

          //オンラインになる人としてユーザーIdをログイン済みの全員に送信
          io.to("LOGGEDIN").emit("addOnlineUser", {data:authData.UserInfo.userId});

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
        //ユーザー情報が空ならエラー
        if (userInfo === null) {
          socket.emit("RESULT::authSession", { result:"ERROR_DB_THING", data:false });
          return;
        }

        //情報が空じゃなければチャンネルへの参加処理
        for (let channelId of userInfo.channelJoined) {
          socket.join(channelId);
        }
        //認証済みの人として参加
        socket.join("LOGGEDIN");
        //このユーザーIdのチャンネルへ参加
        socket.join(userInfo.userId);

        //認証の結果をここで送信
        socket.emit("RESULT::authSession", { result:"SUCCESS", data:true });

        //オンラインのユーザーとして記録
        await addUserOnline(socket.id, dat.userId, dat.sessionId);
        //オンラインになる人としてユーザーIdをログイン済みの全員に送信
        io.to("LOGGEDIN").emit("addOnlineUser", {data:dat.userId});
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

    //セッション情報を取得
    socket.on("fetchSession", async(dat:{RequestSender:IRequestSender, indexNum:number}) => {
      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchSession", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //セッション情報を取得
        const sessionData = await fetchSession(dat.RequestSender.userId, dat.indexNum);
        //nullじゃなければ送信
        if (sessionData !== null) {
          socket.emit("RESULT::fetchSession", { result:"SUCCESS", data:sessionData });
          return;
        }

        //エラーなら
        socket.emit("RESULT::fetchSession", { result:"ERROR_DB_THING", data:null });
        return;
      } catch(e) {
        console.log("auth :: socket(fetchSession) : エラー->", e);
        socket.emit("RESULT::fetchSession", { result:"ERROR_INTERNAL_THING", data:null });
        return;
      }
    });

  });
}
