import { Socket, Server } from "socket.io";
import fetchRoles from "../actionHandler/Role/fetchRoles";
import checkSession from "../actionHandler/auth/checkSession";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //ロール情報をすべて取得
    socket.on("fetchRoles", async (RequestSender) => {
      /*
      返し : {
        result: "SUCCESS",
        data: IUserRole[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(RequestSender))) {
        socket.emit("RESULT::fetchRoles", { result:"ERROR_SESSION_ERROR", data:null });
      }

      try {
        //全ロールを取得
        const roles = await fetchRoles();

        //nullじゃないならそれを返す
        if (roles !== null) {
          socket.emit("RESULT::fetchRoles", { result:"SUCCESS", data:roles });
        } else {
          socket.emit("RESULT::fetchRoles", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchRoles", { result:"ERROR_DB_THING", data:null });
      }
    });

  });
}
