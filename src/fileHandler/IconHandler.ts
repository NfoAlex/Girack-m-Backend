import multer from "multer";
import fs from "fs";
import path from "path";
import checkSession from "../actionHandler/auth/checkSession";
import { ServerInfo } from "../db/InitServer";
import IRequestSender from "../type/requestSender";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "STORAGE/"); // アップロードされるファイルの保存先
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({
  storage: storage,
  limits: { //アイコン用ファイル制限
    fileSize: ServerInfo.config.PROFILE.iconMaxSize
  }
});

module.exports = (app:any) => {

  //プロフィール写真
  app.post("/uploadProfileIcon", upload.single("file"), async (req:any, res:any) => {
    try {
      // 補足データ（metadata）を取得し、JSONとしてパース
      const RequestSender:IRequestSender = JSON.parse(req.body.metadata);

      //セッションの認証
      if (!(await checkSession(RequestSender))) {
        res.status(401).send("/uploadProfileIcon :: アップロード中にエラーが発生しました -> ERROR_SESSION_ERROR");
        return;
      }

      //拡張子取得、確認
      const extension = path.extname(req.file.originalname);
      if (
        extension !== ".jpeg" &&
        extension !== ".jpg" &&
        extension !== ".gif" &&
        extension !== ".png"
      ) throw "拡張子が未対応";
      //移動先のディレクトリを作成
      const newDir = path.join("STORAGE/ICON");
      //ファイル名を"ユーザーID+拡張子へ設定"
      const newPath = path.join(newDir, RequestSender.userId + extension);

      //もともとあるアイコンファイルを削除する
      if (fs.existsSync(newDir + "/" + RequestSender.userId + ".jpg")) {
        fs.unlinkSync(newDir + "/" + RequestSender.userId + ".jpg");
      }
      if (fs.existsSync(newDir + "/" + RequestSender.userId + ".jpeg")) {
        fs.unlinkSync(newDir + "/" + RequestSender.userId + ".jpeg");
      }
      if (fs.existsSync(newDir + "/" + RequestSender.userId + ".gif")) {
        fs.unlinkSync(newDir + "/" + RequestSender.userId + ".gif");
      }
      if (fs.existsSync(newDir + "/" + RequestSender.userId + ".png")) {
        fs.unlinkSync(newDir + "/" + RequestSender.userId + ".png");
      }

      //ファイルを移動
      fs.renameSync(req.file.path, newPath);
      //一時的な検証用ログ
      console.log("req.file.path -> ", req.file.path);
      console.log("newPath -> ", newPath);
      if (fs.existsSync(newPath) === false) throw "ファイルの移動に失敗";
  
      // metadata の内容を表示
      //console.log("multerHandler :: /uploadProfileIcon : req.metadata->", RequestSender);
  
      //結果送信
      res.status(200).send("/uploadProfileIcon :: アップロード成功");
  
    } catch (e) {
      console.log("multerHandler :: /uploadProfileIcon : エラー ->", e);
      res.status(500).send("/uploadProfileIcon :: アップロード中にエラーが発生しました -> ", e);
    }
  });

  //プロフィール画像を返す
  app.get("/icon/:userid", (req:any, res:any) => {
    try {
      //ICONディレクトリへの絶対パス取得
      const absolutePath = path.resolve('./STORAGE/ICON');

      //それぞれの拡張子を確認して送信する
      if (fs.existsSync(absolutePath + "/" + req.params.userid + ".jpg")) {
        res.sendFile(absolutePath + "/" + req.params.userid + ".jpg");
        return;
      }
      if (fs.existsSync(absolutePath + "/" + req.params.userid + ".jpeg")) {
        res.sendFile(absolutePath + "/" + req.params.userid + ".jpeg");
        return;
      }
      if (fs.existsSync(absolutePath + "/" + req.params.userid + ".gif")) {
        res.sendFile(absolutePath + "/" + req.params.userid + ".gif");
        return;
      }
      if (fs.existsSync(absolutePath + "/" + req.params.userid + ".png")) {
        res.sendFile(absolutePath + "/" + req.params.userid + ".png");
        return;
      }

      //最後まで条件に合わないならデフォルト画像送信
      res.sendFile(absolutePath + "/default.jpg");
    } catch(e) {
      res.status(500).send("/icon :: プロフィール画像を取得できませんでした -> ", e);
    }
  });
}
