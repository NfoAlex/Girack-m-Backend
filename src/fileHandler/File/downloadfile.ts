import path from 'node:path';
import { Request, Response } from 'express';
import checkSession from "../../actionHandler/auth/checkSession";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";
import type IRequestSender from "../../type/requestSender";

export default async function downloadfile(req: Request, res: Response) {
  try {

    //console.log("downloadfile :: req.cookie->", req.cookies);

    //ファイル情報を取得
    const fileInfo = fetchFileInfo(req.params.id);
    if (fileInfo === null) {
      res.status(400).send({ result:"ERROR_FILE_MISSING" , data:null });
      return;
    }

    //ユーザーIdをファイルIdから取得
    const uploaderId:string = req.params.id.slice(0,8);

    if (fileInfo.isPublic) {
      const filePath = path.join(`./STORAGE/USERFILE/${uploaderId}/${fileInfo.actualName}`);
      res.download(filePath);
      return;
    }

    //const cookieInfo = JSON.parse(req.cookies);

    //送信者情報取り出し
    const RequestSender:IRequestSender = {
      userId: req.cookies?.userId,
      sessionId: req.cookies?.sessionId
    };
    //console.log("/downloadfile :: checkSession->", RequestSender, checkSession(RequestSender));

    //セッション認証できたらファイル送信
    if (checkSession(RequestSender)) {
      const filePath = path.join(`./STORAGE/USERFILE/${uploaderId}/${fileInfo.actualName}`);
      res.download(filePath);
      return;
    }

    res.status(400).send({ result:"ERROR_WRONG_SESSION" });
    return;

  } catch(e) {

    console.log("/downloadfile :: エラー->", e);
    res.status(500).send({ result:"ERROR_INTERNAL_THING", data:null });

  }
}