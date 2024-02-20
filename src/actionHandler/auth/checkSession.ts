import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";
import type { IUserSession } from "../../type/User";

export default async function checkSession(userId:string, sessionId:string)
:Promise<boolean> {
  return new Promise<boolean> ((resolve) => {
    //ユーザー検索、パスワードを比較する
    db.all("SELECT * FROM USERS_SESSION WHERE userId = ?", [userId], (err:Error, datSession:IUserSession[]) => {
      if (err) {
        console.log("checkSession :: ERROR ->", err);
      } else {
        console.log("checkSession :: 検索結果->", datSession);
        if (datSession.length === 0) resolve(false);

        //セッションデータ分ループしてセッションIDの一致を探す
        for (let dat of datSession) {
          if (dat.sessionId === sessionId) {
            resolve(true);
          }
        }

        //ループ抜けちゃったら失敗として返す
        resolve(false);
      }
    });
  });
}
