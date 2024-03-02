import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";
import type { IUserSession } from "../../type/User";
import type IRequestSender from "../../type/requestSender";

export default async function checkSession(RequestSender:IRequestSender)
:Promise<boolean> {
  return new Promise<boolean> ((resolve) => {
    //データ確認
    if (RequestSender.userId === undefined && RequestSender.sessionId === undefined) {
      resolve(false);
    }

    //ユーザーIdで検索、セッションIDを一致を探す
    db.all(
      "SELECT * FROM USERS_SESSION WHERE userId = ?",
      [RequestSender.userId],
      (err:Error, datSession:IUserSession[]
    ) => {
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
          if (dat.sessionId === RequestSender.sessionId) {
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
