import { Socket, Server } from "socket.io";

import authLogin from "../actionHandler/auth/authLogin";

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

  });
}
