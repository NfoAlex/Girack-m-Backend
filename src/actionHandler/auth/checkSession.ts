import fetchUser from "../User/fetchUser";
import type { IUserSession } from "../../type/User";
import type IRequestSender from "../../type/requestSender";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * セッションIdの一致を調べて認証する
 * @param _RequestSender 
 * @returns 
 */
export default function checkSession(_RequestSender:IRequestSender | undefined)
:boolean {
  try {

    //RequestSenderがundefinedならfalse
    if (_RequestSender === undefined) return false;

    //データ確認
    if (_RequestSender.userId === undefined && _RequestSender.sessionId === undefined) {
      return false;
    }

    //ユーザー情報があるか、BANされているかどうかを確認
    const userInfo = fetchUser(_RequestSender.userId, null);
    if (userInfo === null) {
      return false;
    }
    if (userInfo.banned) {
      return false;
    }

    //セッションデータ取得用の
    const stmtSessionData = db.prepare(
      "SELECT * FROM USERS_SESSION WHERE userId = ?"
    );
    //ループ用データ取得処理部分
    const iterateSessionData = stmtSessionData.iterate(_RequestSender.userId) as Iterable<IUserSession>;

    //ループして一致するセッションデータを探す
    for (const session of iterateSessionData) {
      if (session.sessionId === _RequestSender.sessionId) {
        return true;
      }
    }

    return false;

  } catch(e) {

    console.log("checkSesion :: エラー->", e);
    return false;

  }
}
