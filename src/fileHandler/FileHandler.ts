import fs from "fs";
import multer from "multer";
import path from 'path';
import calcDirectorySize from "../util/FIle/calcDirectorySize";
import checkSession from "../actionHandler/auth/checkSession";
import type { Express, NextFunction } from 'express';
import type IRequestSender from "../type/requestSender";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({

  destination: async function (req, file, cb) {
    console.log("FileHandler :: storage : req.body->", req.body);

    if (req.body !== undefined && Object.keys(req.body).length !== 0) {
      
      //送信者情報取り出し
      const metadata:{
        RequestSender: IRequestSender,
        directory: string
      } = JSON.parse(req.body.metadata);

      ///////////////////////////////////////////////
      //ディレクトリサイズを計算して超えていないか調べる

      //ディレクトリサイズを計算
      const currentFullSize = await calcDirectorySize(metadata.RequestSender.userId, "");
      if (currentFullSize === null) {
        const error = new Error("ERROR_INTERNAL_THING");
        cb(error, "STORAGE/TEMP");
        return;
      }

      //制限を超えているかどうか調べる :: 5000 000 000
      if (currentFullSize + file.size > 5e9) { // DEBUG :: サンプルとして5GB
        const error = new Error("ERROR_OVER_TOTAL_SIZE");
        cb(error, "STORAGE/TEMP");
        return;
      }
      ///////////////////////////////////////////////

      //セッション認証
      if (await checkSession(metadata.RequestSender)) {
        //このユーザー用のディレクトリ作成
        try{fs.mkdirSync("./STORAGE/USERFILE/" + metadata.RequestSender.userId);}catch(e){}
        // アップロードされるファイルの保存先
        cb(null, "STORAGE/USERFILE/"+metadata.RequestSender.userId);
        return;
      } else {
        const error = new Error("ERROR_WRONG_SESSION");
        console.log("FileHandler :: storage : セッションエラー");
        cb(error, "STORAGE/TEMP");
      }

    } else {
      const error = new Error("ERROR_INFO_NOT_FOUND");
      console.log("FileHandler :: storage : 不正なreq.body");
      cb(error, "STORAGE/TEMP");
      return;
    }
  },

  filename: function (req, file, cb) {
    //配置する用のファイル名設定
    const actualName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    
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

  //ファイルのアップロード処理
  app.post("/uploadfile", upload.single("file"), (req:any, res:any) => uploadfile(req, res));

  //ファイルの取得
  app.get("/fetchfile/:id", (req:any, res:any) => fetchfile(req,res));

  //ファイルをダウンロードする
  app.post("/downloadfile/:id", upload.none(), (req:any, res:any) => downloadfile(req,res));

}