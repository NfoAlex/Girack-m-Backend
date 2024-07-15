import fs from "fs";
import multer from "multer";
import checkSession from "../actionHandler/auth/checkSession";
import type { Express, NextFunction } from 'express';
import type IRequestSender from "../type/requestSender";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    console.log("FileHandler :: storage : req.body->", req.body);
    if (req.body !== undefined && Object.keys(req.body).length !== 0) {
      //送信者情報取り出し
      const RequestSender:IRequestSender = JSON.parse(req.body.metadata);

      //セッション認証
      if (await checkSession(RequestSender)) {
        //このユーザー用のディレクトリ作成
        try{fs.mkdirSync("./STORAGE/USERFILE/" + RequestSender.userId);}catch(e){}
        // アップロードされるファイルの保存先
        cb(null, "STORAGE/USERFILE/"+RequestSender.userId);
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
    //ファイル名設定
    cb(null, file.originalname);
  }
});
//アップロード設定を適用
const upload = multer({
  storage: storage
});

import uploadfile from "./File/uploadfile";

module.exports = (app:Express) => {

  //ファイルのアップロード処理
  app.post("/uploadfile", upload.single("file"), (req:any, res:any) => uploadfile(req, res));

}