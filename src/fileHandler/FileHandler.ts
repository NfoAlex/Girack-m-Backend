import fs from "node:fs";
import multer from "multer";
import path from 'node:path';
import cookieParser from "cookie-parser";
import { ServerInfo } from "../db/InitServer";
import calcDirectorySize from "../util/FIle/calcDirectorySize";
import checkSession from "../actionHandler/auth/checkSession";
import type { Express, NextFunction, Request, Response } from 'express';
import type IRequestSender from "../type/requestSender";
import dotenv from "dotenv";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    // 環境変数を読み込む
    const config =  dotenv.config();
    // 環境変数からCORSオリジンを読み込み、配列に変換
    const corsOrigins = config.parsed?.CORS_ORIGIN?.split(",") || [];

    if (req.body !== undefined && Object.keys(req.body).length !== 0) {
      //送信者情報取り出し
      const RequestSender:IRequestSender = {
        userId: req.cookies?.userId,
        sessionId: req.cookies?.sessionId
      };

      //CookieがないかつドメインがcorsOriginsと同じ場合reqestBodyのsessionIdを使って認証
      if((!RequestSender.userId || !RequestSender.sessionId) && corsOrigins.includes(req.headers.origin ?? "")) {
        if (req.body.metadata ) {
          const metadata = JSON.parse(req.body.metadata);
          RequestSender.userId = metadata.RequestSender.userId;
          RequestSender.sessionId = metadata.RequestSender.sessionId;
        }else if(req.headers['x-user-id'] && req.headers['x-session-id'] ){
          RequestSender.userId = req.headers['x-user-id'] as string;
          RequestSender.sessionId = req.headers['x-session-id'] as string;
        }
      }

      //容量情報取り出し
      const contentLength:string|undefined = req.headers['content-length'];
      if (contentLength === undefined) {
        const error = new Error("ERROR_MISSING_FILESIZE");
        cb(error, "STORAGE/TEMP");
        return;
      }
      //取り出した情報を数値化
      const fileSize = Number.parseInt(contentLength);

      ///////////////////////////////////////////////
      //ディレクトリサイズを計算して超えていないか調べる

      //ディレクトリサイズを計算
      const currentFullSize = calcDirectorySize(RequestSender.userId, "");
      if (currentFullSize === null) {
        const error = new Error("ERROR_INTERNAL_THING");
        cb(error, "STORAGE/TEMP");
        return;
      }

      //制限を超えているかどうか調べる
      if (
        currentFullSize + fileSize
        >
        ServerInfo.config.STORAGE.StorageSizeLimit
      ) {
        const error = new Error("ERROR_OVER_TOTAL_SIZE");
        cb(error, "STORAGE/TEMP");
        return;
      }
      ///////////////////////////////////////////////

      //セッション認証
      if (checkSession(RequestSender)) {
        //このユーザー用のディレクトリ作成
        try{fs.mkdirSync(`./STORAGE/USERFILE/${RequestSender.userId}`);}catch(e){}
        // アップロードされるファイルの保存先
        cb(null, `STORAGE/USERFILE/${RequestSender.userId}`);
        return;
      }
      
      const error = new Error("ERROR_WRONG_SESSION");
      console.log("FileHandler :: storage : セッションエラー");
      cb(error, "STORAGE/TEMP");

    } else {
      const error = new Error("ERROR_INFO_NOT_FOUND");
      console.log("FileHandler :: storage : 不正なreq.body");
      cb(error, "STORAGE/TEMP");
      return;
    }
  },

  filename: (req, file, cb) => {
    //配置する用のファイル名設定
    const actualName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    
    //バックエンドに配置するファイル名をreq.bodyに含める
    req.body.actualName = actualName;

    //ファイル名設定
    cb(null, actualName)
    
  }

});
//アップロード設定を適用
const upload = multer({
  storage: storage
});

import uploadfile from "./File/uploadfile";
import fetchfile from "./File/fetchfile";
import downloadfile from "./File/downloadfile";

module.exports = (app:Express) => {

  //クッキー処理用
  app.use(cookieParser());

  //ファイルのアップロード処理
  app.post("/uploadfile", upload.single("file"), (req:Request, res:Response) => uploadfile(req, res));

  //ファイルの取得
  app.get("/fetchfile/:id", (req:Request, res:Response) => fetchfile(req,res));

  //ファイルをダウンロードする
  app.get("/downloadfile/:id", upload.none(), (req:Request, res:Response) => downloadfile(req,res));

}