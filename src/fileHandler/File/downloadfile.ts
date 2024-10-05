import path from 'node:path';
import { Request, Response } from 'express';
import checkSession from "../../actionHandler/auth/checkSession";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";
import type IRequestSender from "../../type/requestSender";
import dotenv from "dotenv";

export default async function downloadfile(req: Request, res: Response) {
  try {
    // 環境変数を読み込む
    const config =  dotenv.config();
    // 環境変数からCORSオリジンを読み込み、配列に変換
    const corsOrigins = config.parsed?.CORS_ORIGIN?.split(",") || [];
    // ファイル情報を取得
    const fileInfo = fetchFileInfo(req.params.id);
    if (fileInfo === null) {
      res.status(400).send({ result: "ERROR_FILE_MISSING", data: null });
      return;
    }

    // ユーザーIdをファイルIdから取得
    const uploaderId: string = req.params.id.slice(0, 8);

    if (fileInfo.isPublic) {
      const filePath = path.join(`./STORAGE/USERFILE/${uploaderId}/${fileInfo.actualName}`);
      res.download(filePath, fileInfo.name);
      return;
    }

    // クッキーからユーザーIDとセッションIDを取得
    const userIdFromCookie = req.cookies?.userId;
    const sessionIdFromCookie = req.cookies?.sessionId;

    // ヘッダーからユーザーIDとセッションIDを取得
    const userIdFromHeader = req.headers['x-user-id'] as string && corsOrigins.includes(req.headers.origin ?? "") ? req.headers['x-user-id'] as string: "";
    const sessionIdFromHeader = req.headers['x-session-id'] as string && corsOrigins.includes(req.headers.origin ?? "") ? req.headers['x-session-id'] as string : "";

    // クッキーがある場合はクッキーから、ない場合はヘッダーから取得
    const RequestSender: IRequestSender = {
      userId: userIdFromCookie || userIdFromHeader,
      sessionId: sessionIdFromCookie || sessionIdFromHeader
    };

    // ユーザーIDとセッションIDが存在しない場合はエラーを返す
    if (!RequestSender.userId || !RequestSender.sessionId) {
      res.status(401).send({ result: "ERROR_WRONG_SESSION" });
      return;
    }

    // セッション認証できたらファイル送信
    if (checkSession(RequestSender)) {
      const filePath = path.join(`./STORAGE/USERFILE/${uploaderId}/${fileInfo.actualName}`);
      res.download(filePath, fileInfo.name);
      return;
    }

    res.status(400).send({ result: "ERROR_WRONG_SESSION" });
    return;

  } catch (e) {
    console.log("/downloadfile :: エラー->", e);
    res.status(500).send({ result: "ERROR_INTERNAL_THING", data: null });
  }
}