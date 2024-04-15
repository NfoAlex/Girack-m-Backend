import sqlite3 from "sqlite3";
import type { IMessageReadId } from "../../type/Message";
const db = new sqlite3.Database("./records/USER.db");

//メッセージの最終既読IdをJSONで取得
export default async function getMessageReadId(userId:string)
:Promise<IMessageReadId|null> {
  return new Promise((resolve) => {
    db.all(
      `
      SELECT messageReadTime FROM USERS_SAVES
        WHERE userId='` + userId + `'
      `,
      (err:Error, messageReadIdBeforeParsed:string) => {
        if (err) {
          resolve(null);
          return;
        } else {
          //パースして返す
          const messageReadTime:IMessageReadId =
            JSON.parse(messageReadIdBeforeParsed);

          resolve(messageReadTime);
          return;
        }
      }
    );
  });
}
