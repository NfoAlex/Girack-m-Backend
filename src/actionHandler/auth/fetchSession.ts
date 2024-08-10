import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import type { IUserSession } from "../../type/User";

/**
 * 指定したユーザーのセッションデータを取得
 * @param _userId 
 * @param _indexNumber 
 * @returns 
 */
export default async function fetchSession(_userId: string, _indexNumber: number)
:Promise<IUserSession[] | null> {
  try {

    //オフセットでずらすデータ数
    const offsetNum = 10 * (_indexNumber-1 || 0);

    return new Promise((resolve) => {
      db.all(
        "SELECT * FROM USERS_SESSION WHERE userId=? LIMIT 10 OFFSET ?",
        [_userId, offsetNum],
        (err:Error, sessionData:IUserSession[]) => {
          //エラーハンドラ
          if (err) {
            resolve(null);
            return;
          }

          //データを返す
          resolve(sessionData);
          return;
        }
      );
    });

  } catch(e) {

    console.log("fetchSession :: エラー->", e);
    return null;

  }
}