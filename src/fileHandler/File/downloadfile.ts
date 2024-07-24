import path from 'path';
import checkSession from "../../actionHandler/auth/checkSession";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";
import type IRequestSender from "../../type/requestSender";

export default async function downloadfile(req:any, res:any) {
  try {

    console.log("/downloadfile :: metadata->", req.body);

    //送信者情報を取得
    const metadata:{RequestSender:IRequestSender} = JSON.parse(req.body.metadata);

    //ファイル情報を取得
    const fileInfo = await fetchFileInfo(req.params.id);
    if (fileInfo === null) {
      res.status(400).send({ result:"ERROR_FILE_MISSING" , data:null });
      return;
    }

    //ユーザーIdをファイルIdから取得
    const uploaderId:string = req.params.id.slice(0,8);

    if (fileInfo.isPublic) {
      const filePath = path.join("./STORAGE/USERFILE/" + uploaderId + "/" + fileInfo.actualName);
      res.download(filePath);
      return;
    } else {
      //送信者情報が無いならそうエラーを送信
      if (req.body.metadata === undefined) {
        res.status(400).send({ result:"ERROR_FILE_IS_PRIVATE" });
        return;
      }

      //送信者情報取り出し
      const RequestSender:IRequestSender = metadata.RequestSender;
      console.log("/downloadfile :: checkSession->", await checkSession(RequestSender));

      //セッション認証する
      if (await checkSession(RequestSender)) {
        const filePath = path.join("./STORAGE/USERFILE/" + uploaderId + "/" + fileInfo.actualName);
        res.download(filePath);
        return;
      } else {
        res.status(400).send({ result:"ERROR_WRONG_SESSION" });
        return;
      }
    }

  } catch(e) {

    console.log("/downloadfile :: エラー->", e);
    res.status(500).send({ result:"ERROR_INTERNAL_THING", data:null });

  }
}