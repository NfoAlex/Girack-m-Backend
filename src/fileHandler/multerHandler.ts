import multer from "multer";
import fs from "fs";
import path from "path";

// multer の設定（ディスクストレージを使用）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "STORAGE/"); // アップロードされるファイルの保存先
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({ storage: storage });

module.exports = (app:any) => {

  console.log("multerHandlers :: ファイル");

  //プロフィール写真
  app.post("/uploadProfileIcon", upload.single("file"), (req:any, res:any) => {
    try {
      // ファイルの情報は req.file に格納される
      console.log("multerHandler :: /uploadProfileIcon : req.file->", req.file);
  
      // 補足データ（metadata）を取得し、JSONとしてパース
      const metadata = JSON.parse(req.body.metadata);

      //拡張子取得
      const extension = path.extname(req.file.originalname);
      //移動先のディレクトリを作成
      const newDir = path.join("STORAGE/ICON");
      //ファイル名を"ユーザーID+拡張子へ設定"
      const newPath = path.join(newDir, metadata.userId + extension);

      //ファイルを移動
      fs.renameSync(req.file.path, newPath);
  
      // metadata の内容を表示
      console.log("multerHandler :: /uploadProfileIcon : req.metadata->", metadata);
  
      //結果送信
      res.status(200).send("/uploadProfileIcon :: アップロード成功");
  
    } catch (e) {
      console.log("multerHandler :: /uploadProfileIcon : エラー ->", e);
      res.status(500).send("/uploadProfileIcon :: アップロード中にエラーが発生しました -> " + e);
    }
  });

  app.get("/hello", (req:any, res:any) => {
    try {  
      res.status(200).send("world");
  
    } catch (e) {
      res.status(500).send("/hello :: 内部エラーが発生しました -> ", e);
    }
  });
    }
  });
}
