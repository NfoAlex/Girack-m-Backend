import sqlite3 from "sqlite3";
import type { IMessageReadId } from "../../type/Message";
const db = new sqlite3.Database("./records/USER.db");

//メッセージの最終既読IdをJSONで取得
export default async function getMessageReadId(userId:string)
:Promise<IMessageReadId|null> {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT messageReadId FROM USERS_SAVES
          WHERE userId='` + userId + `'
        `,
        (err:Error, messageReadIdBeforeParsed:[{messageReadId:any}]) => {
          if (err) {
            console.log("getMessageReadId :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("getMessageReadId :: db : data->", messageReadIdBeforeParsed);
            //パースして返す
            const messageReadId:IMessageReadId =
              JSON.parse(
                messageReadIdBeforeParsed[0]['messageReadId']
              );

            resolve(messageReadId);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("getMessageReadId :: エラー->", e);
    return null;

  }
}
