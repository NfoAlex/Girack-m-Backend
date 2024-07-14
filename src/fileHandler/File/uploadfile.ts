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

    res.status(200).send("uploadfile");

  } catch (e) {

    res.status(500).send("/uploadfile :: 内部エラーが発生しました -> ", e);
  
  }
}