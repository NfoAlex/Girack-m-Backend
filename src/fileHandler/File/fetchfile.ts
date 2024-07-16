import checkSession from "../../actionHandler/auth/checkSession";
import type IRequestSender from "../../type/requestSender";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";

/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default async function fetchfile(req:any, res:any) {
  try {

    console.log("/uploadfile :: ファイルが書き込まれました");
    // 補足データ（metadata）を取得し、JSONとしてパース
    console.log("/uploadfile :: これからの処理に使うreq.body.metadata->", req.body.metadata);

    //ファイル情報を取得
    const fileInfo = await fetchFileInfo(req.param.fileId);
    if (fileInfo === null) {
      res.status(400).send({ result:"ERROR_FILE_MISSING" });
      return;
    }

    //公開されているならそのまま送信、違うならセッション認証
    if (fileInfo.isPublic) {
      res.status(200).send({ result:"SUCCESS" });
      return;
    } else {
      //送信者情報が無いならそうエラーを送信
      if (req.body.metadata === undefined) {
        res.status(400).send({ result:"ERROR_FILE_IS_PRIVATE" });
        return;
      }

      //送信者情報取り出し
      const RequestSender:IRequestSender = JSON.parse(req.body.metadata);
      //セッション認証する
      if (await checkSession(RequestSender)) {
        res.status(200).send({ result:"SUCCESS" });
        return;
      } else {
        res.status(400).send({ result:"ERROR_WRONG_SESSION" });
        return;
      }
    }

  } catch (e) {

    console.log("/uploadfile :: エラー!->", e);
    res.status(500).send({ result:"ERROR_INTERNAL_THING" });
  
  }
}