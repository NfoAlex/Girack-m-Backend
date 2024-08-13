import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserSession } from "../../type/User";

/**
 * 指定したユーザーのセッションデータを取得
 * @param _userId 
 * @param _indexNumber 
 * @returns 
 */
export default function fetchSession(
  _userId: string,
  _sessionId: string,
  _indexNumber: number
): {
  sessionData: IUserSession[],
  activeSession: IUserSession
} 
  |
null
{
  try {

    //オフセットでずらすデータ数
    const offsetNum = 10 * (_indexNumber-1 || 0);

    //セッションデータ一覧を表示分だけ取得
    const sessionData = db.prepare(
      "SELECT * FROM USERS_SESSION WHERE userId=? LIMIT 10 OFFSET ?"
    ).all(_userId, offsetNum) as IUserSession[];

    //操作者のアクティブセッションを取得
    const activeSession = db.prepare(
      "SELECT * FROM USERS_SESSION WHERE userId=? AND sessionId=?"
    ).get(_userId, _sessionId) as IUserSession|undefined;
    if (activeSession === undefined) return null;

    return {sessionData: sessionData, activeSession: activeSession};

  } catch(e) {

    console.log("fetchSession :: エラー->", e);
    return null;

  }
}