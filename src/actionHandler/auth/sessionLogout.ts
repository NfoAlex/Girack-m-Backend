import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

/**
 * セッションをログアウトさせる
 */
export default async function sessionLogout(_userId:string, _targetSessionId:string):Promise<boolean> {
  try {

    return new Promise((resolve) => {
      db.run(
        "DELETE FROM USERS_SESSION WHERE userId=? AND sessionId=?",
        [_userId, _targetSessionId],
        (err:Error) => {
          //エラーハンドラ
          if (err) {
            console.log("sessionLogout :: db(削除) : エラー->", err);
            resolve(false);
            return;
          } 
          
          resolve(true);
          return;
        }
      )
    })

  } catch(e) {

    console.log("sessionLogout :: エラー->", e);
    return false;

  }
}