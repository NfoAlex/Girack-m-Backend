import checkSession from "../../actionHandler/auth/checkSession";
import type IRequestSender from "../../type/requestSender";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";
import dotenv from "dotenv";


/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default async function fetchfile(req:any, res:any) {
  try {
    // 環境変数を読み込む
    const config =  dotenv.config();
    // 環境変数からCORSオリジンを読み込み、配列に変換
    const corsOrigins = config.parsed?.CORS_ORIGIN?.split(",") || [];
    //ファイル情報を取得
    const fileInfo = fetchFileInfo(req.params.id);
    if (fileInfo === null) {
      res.status(400).send({ result:"ERROR_FILE_MISSING" });
      return;
    }

    //公開されているならそのまま送信、違うならセッション認証
    if (fileInfo.isPublic) {
      res.status(200).send({ result:"SUCCESS" });
      return;
    }
    
    //送信者情報が無いならそうエラーを送信
    if (req.body.metadata === undefined) {
      res.status(400).send({ result:"ERROR_FILE_IS_PRIVATE" });
      return;
    }

    //送信者情報取り出し
    //const RequestSender:IRequestSender = JSON.parse(req.body.metadata);
    const RequestSender:IRequestSender = {
      userId: req.cookies?.userId,
      sessionId: req.cookies?.sessionId
    };

    //セッション認証できたら成功と送信
    if (req.cookie && checkSession(RequestSender)) {
      res.status(200).send({ result:"SUCCESS" });
      return;
    }else if (req.cookies === undefined && corsOrigins.includes(req.headers.origin)) { //CookieがないかつドメインがcorsOriginsと同じ場合reqestBodyのsessionIdを使って認証
      const RequestSender:IRequestSender = {
        userId: req.body.metadata.RequestSender.userId,
        sessionId: req.body.metadata.RequestSender.sessionId
      };
      if (checkSession(RequestSender)) {
        res.status(200).send({ result:"SUCCESS" });
        return;
      }
    }

    res.status(400).send({ result:"ERROR_WRONG_SESSION" });
    return;

  } catch (e) {

    console.log("/uploadfile :: エラー!->", e);
    res.status(500).send({ result:"ERROR_INTERNAL_THING" });
  
  }
}