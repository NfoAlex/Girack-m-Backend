import { Socket, Server } from "socket.io";
import IRequestSender from "../type/requestSender";
import checkSession from "../actionHandler/auth/checkSession";
import saveMessage from "../actionHandler/Message/saveMessage";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //ログイン認証
    socket.on("sendMessage", async (
      dat:{
        RequestSender:IRequestSender,
        message: {
          channelId: string,
          content: string
        }
      }
    ) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_MISSING_INFO"|"ERROR_SESSION_ERROR",
        data: IMessage|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::sendMessage", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //メッセージデータを処理
        const messageData = await saveMessage(
          dat.RequestSender.userId,
          dat.message
        );

        //処理に成功したのならメッセージ送信
        if (messageData !== null) {
          io.to(messageData.channelId).emit("receiveMessage", messageData);
        }
      } catch(e) {
        console.log("Message :: socket(sendMessage) : エラー->", e);
      }
    });

  });
}
