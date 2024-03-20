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
  
      // metadata の内容を表示
      console.log("multerHandler :: /uploadProfileIcon : req.metadata->", metadata);
  
      res.status(200).send("ファイルとメタデータのアップロードに成功しました。");
  
    } catch (e) {
      res.status(500).send("アップロード中にエラーが発生しました。", e);
    }
  });

  app.get("/hello", (req:any, res:any) => {
    try {  
      res.status(200).send("world");
  
    } catch (e) {
      res.status(500).send("アップロード中にエラーが発生しました。", e);
    }
  });
}
