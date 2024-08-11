import fetchUser from "../User/fetchUser";
import type { IUserSession } from "../../type/User";
import type IRequestSender from "../../type/requestSender";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

export default async function checkSession(RequestSender:IRequestSender)
:Promise<boolean> {
  try {

    //データ確認
    if (RequestSender.userId === undefined && RequestSender.sessionId === undefined) {
      return false;
    }

    //ユーザー情報があるか、BANされているかどうかを確認
    const userInfo = await fetchUser(RequestSender.userId, null);
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
    const iterateSessionData = stmtSessionData.iterate(RequestSender.userId) as Iterable<IUserSession>;

    //ループして一致するセッションデータを探す
    for (const session of iterateSessionData) {
      if (session.sessionId === RequestSender.sessionId) {
        return true;
      }
    }

    return false;

  } catch(e) {

    console.log("checkSesion :: エラー->", e);
    return false;

  }
}
