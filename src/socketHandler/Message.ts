import { Socket, Server } from "socket.io";
import checkSession from "../actionHandler/auth/checkSession";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //ログイン認証
    socket.on("sendMessage", async (dat:{username:string, password:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSING_INFO"|"ERROR_SESSION_ERROR",
        data: IMessage|null
      }
      */
    });

  });
}
