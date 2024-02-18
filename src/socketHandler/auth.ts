import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";
import { IUserInfo } from "../type/User";
import authRegister from "../actionHandler/auth/authRegister";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //ログイン認証
    socket.on("authLogin", (dat:{username:string, password:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_WRONGINFO",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      console.log("auth :: authLogin : dat->", dat);
      
      const authResult:boolean = authLogin(dat.username, dat.password);
      
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
          socket.emit("RESULTauthRegister", {result:"ERROR_WRONGINVITECODE", data:null});
        } else {
          socket.emit("RESULTauthRegister", {result:"SUCCESS", data:datUser});
        }

        console.log("auth :: authRegister : dat->", datUser);
      }
      catch (e) {
        socket.emit("RESULTauthRegister", {result:"ERROR_DB_THING", data:null});
      }
    });

  });
}
