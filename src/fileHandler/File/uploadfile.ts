import fs from "fs";
import path from "path";
import checkSession from "../../actionHandler/auth/checkSession";
import IRequestSender from "../../type/requestSender";

/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default async function uploadfile(req:any, res:any) {
  try {

    // 補足データ（metadata）を取得し、JSONとしてパース
    const RequestSender:IRequestSender = JSON.parse(req.body.metadata);

    //セッションの認証
    if (!(await checkSession(RequestSender))) {
      res.status(401).send("/uploadProfileIcon :: アップロード中にエラーが発生しました -> ERROR_SESSION_ERROR");
      return;
    }

    //このユーザー用のディレクトリ作成
    try{fs.mkdirSync("./STORAGE/USERFILE/" + RequestSender.userId);}catch(e){}

    //拡張子取得
    const extension = path.extname(req.file.originalname);
    //移動先のディレクトリを作成
    const newDir = path.join("STORAGE/USERFILE/" + RequestSender.userId);
    //ファイル名を"ユーザーID+拡張子へ設定"
    const newPath = path.join(newDir, RequestSender.userId + extension);
    
    //ファイルを移動
    fs.renameSync(req.file.path, newPath);

    res.status(200).send("uploadfile");

  } catch (e) {

    res.status(500).send("/uploadfile :: 内部エラーが発生しました -> ", e);
  
  }
}