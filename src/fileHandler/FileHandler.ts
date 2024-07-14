import multer from "multer";

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

import uploadfile from "./File/uploadfile";

module.exports = (app:any) => {
  //ファイルのアップロード処理
  app.post("/uploadfile", upload.single("file"), (req:any, res:any) => uploadfile(req, res));
}