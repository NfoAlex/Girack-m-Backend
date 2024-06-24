import sqlite3 from "sqlite3";
import type { IMessageReadTime } from "../../type/Message";
const db = new sqlite3.Database("./records/USER.db");

import getMessageReadTime from "./getMessageReadTime";

export default async function setMessageReadTime(
  userId: string,
  channelId: string,
  messageTime: string
):Promise<boolean> {
  try {

    //メッセージ既読時間の読み取り
    const messageReadTime:IMessageReadTime|null = await getMessageReadTime(userId);
    //取得できなかったら失敗と返す
    if (messageReadTime===null) return false;

    //データを更新する
    messageReadTime[channelId] = messageTime;

    //DBへの書き込み処理
    return new Promise((resolve) => {
      db.run(
        `
        UPDATE USERS_SAVES SET
          messageReadTime=?
        WHERE userId='` + userId + `'
        `,
        JSON.stringify(messageReadTime),
        (err:Error) => {
          if (err) {
            console.log("setMessageReadTime :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            //console.log("setMessageReadTime :: db : 成功 messageReadTime->", messageReadTime);
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("setMessageReadTime :: エラー->", e);
    return false;

  }
}
