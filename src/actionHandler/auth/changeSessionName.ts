import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

/**
 * セッション名を変更
 * @param _userId 
 * @param _targetSessionId 
 * @param _newName 
 * @returns 
 */
export default async function changeSessionName(
  _userId: string,
  _targetSessionId: string,
  _newName: string
):Promise<boolean> {
  try {

    return new Promise((resolve) => {
      db.run(
        `
        UPDATE USERS_SESSION SET sessionName=?
          WHERE userId=? AND sessionId=?
        `,
        [_newName, _userId, _targetSessionId],
        (err:Error) => {
          //エラーハンドラ
          if (err) {
            console.log("changeSessionname :: db(セッション名変更) : エラー->", err);
            return false;
          }

          return true;
        }
      );
    });

  } catch(e) {

    console.log("changeSessionname: エラー->", e);
    return false;

  }
}