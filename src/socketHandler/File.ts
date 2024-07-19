import { Socket, Server } from "socket.io";

import checkSession from "../actionHandler/auth/checkSession";
import type IRequestSender from "../type/requestSender";

import fetchFileIndex from "../actionHandler/File/fetchFileIndex";
import deleteFile from "../actionHandler/File/deleteFile";
import fetchFileInfo from "../util/FIle/fetchFileInfo";
import createFolder from "../actionHandler/File/createFolder";
import fetchFolders from "../util/FIle/fetchFolders";
import deleteFolder from "../actionHandler/File/deleteFolder";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {
    
    //自分のファイルインデックスを取得
    socket.on("fetchFileIndex", async (
      dat: {
        RequestSender: IRequestSender,
        directory: string,
        searchQuery: string
      }
    ) => {
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
        const fileIndex = await fetchFileIndex(
          dat.RequestSender.userId,
          dat.directory,
          dat.searchQuery
        );

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
    });

    //ファイル単体情報の取得
    socket.on("fetchFileInfo", async (dat:{RequestSender:IRequestSender, fileId:string}) => {
      try {
        //ファイル情報の取得
        const fileInfo = await fetchFileInfo(dat.fileId);
        //nullならそう返す
        if (fileInfo === null) {
          socket.emit("RESULT::fetchFileInfo:" + dat.fileId, { result:"ERROR_FILE_MISSING", data:null });
          return;
        }

        console.log("File :: socket(fetchFileInfo) : ファイル情報->", fileInfo);

        //ファイルが公開されているならそのまま送信、違うならセッション確認
        if (fileInfo.isPublic) {
          socket.emit("RESULT::fetchFileInfo:" + dat.fileId, { result:"SUCCESS", data:fileInfo });
        } else {
          //もし送信者情報が無いなら非公開ファイルだと言うことだけ送信
          if (dat.RequestSender === undefined) {
            socket.emit("RESULT::fetchFileInfo:" + dat.fileId, { result:"ERROR_FILE_IS_PRIVATE", data:null });
            return;
          }
          
          //セッション認証をする
          const authSessionResult = await checkSession(dat.RequestSender);

          //結果に応じてそう送信
          if (authSessionResult) {
            socket.emit("RESULT::fetchFileInfo:" + dat.fileId, {
              result: "SUCCESS",
              data: fileInfo
            });
          } else {
            socket.emit("RESULT::fetchFileInfo:" + dat.fileId, {
              result: "ERROR_WRONG_SESSION",
              data: null
            });
          }
        }
      } catch(e) {
        console.log("File :: socket(fetchFileInfo) : エラー->", e);
        socket.emit("RESULT::fetchFileInfo:" + dat.fileId, {
          result: "ERROR_INTERNAL_THING",
          data: null
        });
      }
    });

    //フォルダーを取得
    socket.on("fetchFolders", async (
      dat: {
        RequestSender: IRequestSender,
        positionedDirectoryId: string
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchFolders", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //フォルダーを取得
        const folder = await fetchFolders(
          dat.RequestSender.userId,
          dat.positionedDirectoryId
        );
        //取得内容に応じて結果を送信
        if (folder !== null) {
          socket.emit("RESULT::fetchFolders", { result:"SUCCESS", data:folder });
        } else {
          socket.emit("RESULT::fetchFolders", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        console.log("socket(fetchFolders) :: エラー->", e);
        socket.emit("RESULT::fetchFolders", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //フォルダーを作成する
    socket.on("createFolder", async (
      dat: {
        RequestSender: IRequestSender,
        folderName: string,
        directoryId: string
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::createFolder", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      try {
        //フォルダーを作成する
        const createFolderResult = await createFolder(
          dat.RequestSender.userId,
          dat.folderName,
          dat.directoryId
        );

        //結果に応じてそう送信
        if (createFolderResult) {
          socket.emit("RESULT::createFolder", { result:"SUCCESS", dat:null });
        } else {
          socket.emit("RESULT::createFolder", { result:"ERROR_DB_THING", dat:null });
        }
      } catch(e) {
        console.log("socket(createFolder) :: エラー->", e);
        socket.emit("RESULT::createFolder", { result:"ERROR_INTERNAL_THING", dat:null });
      }
    });

    //フォルダーと中身のすべてを削除
    socket.on("deleteFolder", async (dat:{RequestSender:IRequestSender, folderId:string}) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::deleteFolder", {
          result: "ERROR_WRONG_SESSION",
          data: null
        });
        return;
      }

      //もしディレクトリIdが一番上ならエラー
      if (dat.folderId === "" || dat.folderId === undefined) {
        socket.emit("RESULT::deleteFolder", { result:"ERROR_CANNOT_DELETE_ROOT", data:null });
        return;
      }

      try {
        //フォルダーの削除、結果受け取り
        const deleteFolderResult = await deleteFolder(dat.RequestSender.userId, dat.folderId);
        //結果に応じてそう送信
        if (deleteFolderResult) {
          socket.emit("RESULT::deleteFolder", { result:"SUCCESS", data:null });
        } else {
          socket.emit("RESULT::deleteFolder", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        console.log("socket(deleteFolder) :: エラー->", e);
        socket.emit("RESULT::deleteFolder", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

  });
}
