import sqlite3 from "sqlite3";
import type { IMessageReadTime } from "../../type/Message";
const db = new sqlite3.Database("./records/USER.db");

//メッセージの最終既読時間をJSONで取得
export default async function getMessageReadTime(userId:string)
:Promise<IMessageReadTime|null> {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT messageReadTime FROM USERS_SAVES
          WHERE userId='` + userId + `'
        `,
        (err:Error, messageReadTimeBeforeParsed:[{messageReadTime:string}]) => {
          if (err) {
            console.log("getMessageReadTime :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("getMessageReadTime :: db : data->", messageReadTimeBeforeParsed);
            //パースして返す
            const messageReadTime:IMessageReadTime =
              JSON.parse(
                messageReadTimeBeforeParsed[0]['messageReadTime']
              );

            resolve(messageReadTime);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("getMessageReadTime :: エラー->", e);
    return null;

  }
}
