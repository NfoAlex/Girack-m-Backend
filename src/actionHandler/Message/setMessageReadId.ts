import sqlite3 from "sqlite3";
import type { IMessageReadId } from "../../type/Message";
const db = new sqlite3.Database("./records/USER.db");

import getMessageReadId from "./getMessageReadId";

export default async function setMessageReadId(
  userId: string,
  channelId: string,
  messageId: string
):Promise<boolean> {
  try {

    //メッセージ既読Idの読み取り
    const messageReadId:IMessageReadId|null = await getMessageReadId(userId);
    //取得できなかったら失敗と返す
    if (messageReadId===null) return false;

    //データを更新する
    messageReadId[channelId] = messageId;

    //DBへの書き込み処理
    return new Promise((resolve) => {
      db.run(
        `
        UPDATE USERS_SAVES SET
          messageReadId=?
        WHERE userId='` + userId + `'
        `,
        JSON.stringify(messageReadId),
        (err:Error) => {
          if (err) {
            console.log("setMessageReadId :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            //console.log("setMessageReadId :: db : 成功 messageReadTime->", messageReadId);
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("setMessageReadId :: エラー->", e);
    return false;

  }
}
