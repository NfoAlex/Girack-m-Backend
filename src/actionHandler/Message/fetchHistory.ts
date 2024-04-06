import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import { IMessage } from "../../type/Message";

export default async function fetchHistory(
  channelId: string,
  positionMessageId: string
):Promise<IMessage[] | null> {
  try {
  
    //メッセージのインデックス番号を計算する
    await calcPositionOfMessage(channelId, positionMessageId);

    /*
    const history = await new Promise ((resolve) => {
      db.all(
        `
        SELECT * FROM C` + channelId + `
          WHERE 
        `
      );
    });
    */

    return null;

  } catch(e) {

    console.log("fetchHistory :: エラー->", e);
    return null;

  }
}

//メッセージの位置を取得
async function calcPositionOfMessage(channelId:string, messageId:string)
:Promise<number|null> {
  return await new Promise((resolve) => {
    db.all(
      `
      WITH NumberedRows AS (
        SELECT
          *,
          ROW_NUMBER() OVER (ORDER BY time) AS RowNum
        FROM
          C` + channelId + `
      )
      SELECT
        *
      FROM
        NumberedRows
      WHERE
        messageId = '` + messageId + `';
      `,
      (err:Error, messageWithIndex:any) => {
        if (err) {
          console.log("fetchHistory :: db : エラー->", err);
          resolve(null);
          return;
        } else {
          console.log("fetchHistory :: db : data->", messageWithIndex);
          resolve(messageWithIndex.RowNum);
          return;
        }
      }
    );
  });
}
