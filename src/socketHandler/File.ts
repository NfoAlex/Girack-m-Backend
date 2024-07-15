import { Socket, Server } from "socket.io";

import checkSession from "../actionHandler/auth/checkSession";
import type IRequestSender from "../type/requestSender";

import fetchFileIndex from "../actionHandler/File/fetchFileIndex";
import deleteFile from "../actionHandler/File/deleteFile";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //自分のファイルインデックスを取得
    socket.on("fetchFileIndex", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_WRONGINFO",
        data: IFile[]
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchFileIndex", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //ファイルインデックス取得
        const fileIndex = await fetchFileIndex(dat.RequestSender.userId);

        //データに応じて結果を送信
        if (fileIndex !== null) {
          //成功
          socket.emit("RESULT::fetchFileIndex", {
            result:"SUCCESS",
            data: fileIndex
          });
        } else {
          //エラー
          socket.emit("RESULT::fetchFileIndex", {
            result:"ERROR_DB_THING",
            data: null
          });
        }
      } catch(e) {
        //認証無理だったら
        socket.emit("RESULT::fetchFileIndex", { result:"ERROR_DB_THING", data:null });
        console.log("onlineUsers :: socket(fetchFileIndex) : error->", e);
      }
    });

    //ファイルを削除する
    socket.on("deleteFile", async (dat:{RequestSender:IRequestSender, fileId:string}) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::deleteFile", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //ファイル削除し結果を受け取る
        const deleteFileResult = await deleteFile(dat.RequestSender.userId, dat.fileId);
        //結果に応じて送信
        if (deleteFileResult) {
          socket.emit("RESULT::deleteFile", {result:"SUCCESS", data:null});
        } else {
          socket.emit("RESULT::deleteFile", {result:"ERROR_DB_THING", data:null});
        }
      } catch(e) {
        socket.emit("RESULT::deleteFile", {result:"ERROR_INTERNAL_THING", data:null});
      }
    })

  });
}
