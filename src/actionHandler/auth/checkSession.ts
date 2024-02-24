import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";
import type { IUserSession } from "../../type/User";

export default async function checkSession(userId:string, sessionId:string)
:Promise<boolean> {
  return new Promise<boolean> ((resolve) => {
    //ユーザーIdで検索、セッションIDを一致を探す
    db.all("SELECT * FROM USERS_SESSION WHERE userId = ?", [userId], (err:Error, datSession:IUserSession[]) => {
      if (err) {
        console.log("checkSession :: ERROR ->", err);
      } else {
        //console.log("checkSession :: 検索結果->", datSession);
        //データが空なら終わらせる
        if (datSession.length === 0) {
          resolve(false);
          return;
        }

        //セッションデータ分ループしてセッションIDの一致を探す
        for (let dat of datSession) {
          if (dat.sessionId === sessionId) {
            resolve(true);
            return;
          }
        }

        //ループ抜けちゃったら失敗として返す
        resolve(false);
        return;
      }
    });
  });
}
