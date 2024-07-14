import multer from "multer";
import fs from "fs";
import checkSession from "../../actionHandler/auth/checkSession";
import { ServerInfo } from "../../db/InitServer";
import IRequestSender from "../../type/requestSender";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "STORAGE/TEMP"); // アップロードされるファイルの保存先
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});
//アップロード設定を適用
const upload = multer({
  storage: storage
});

export default async function uploadfile(req:any, res:any) {
  try {

    // 補足データ（metadata）を取得し、JSONとしてパース
    const RequestSender:IRequestSender = JSON.parse(req.body.metadata);

    //セッションの認証
    if (!(await checkSession(RequestSender))) {
      res.status(401).send("/uploadProfileIcon :: アップロード中にエラーが発生しました -> ERROR_SESSION_ERROR");
      return;
    }

    res.status(200).send("uploadfile");

  } catch (e) {

    res.status(500).send("/uploadfile :: 内部エラーが発生しました -> ", e);
  
  }
}