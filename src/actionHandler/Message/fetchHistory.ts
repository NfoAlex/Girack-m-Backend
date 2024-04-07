import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import { IMessage } from "../../type/Message";

export default async function fetchHistory(
  channelId: string,
  positionMessageId: string
):Promise<IMessage[] | null> {
  try {

    //履歴を読み出し始める位置
    let position:number|null = 0;

    //メッセージ位置の設定、指定がないなら0
    if (positionMessageId !== "") {
      //メッセージのインデックス番号を計算する
      position = await calcPositionOfMessage(channelId, positionMessageId);
      //結果がエラーならnullを返す
      if (position === null) return null;
    }

    //履歴の長さを取得
    const historyLength:number|null = await new Promise((resolve):number|null => {
      db.all(
        `
        SELECT COUNT(*) FROM C` + channelId + `
        `,
        (err:Error, length:{"COUNT(*)":number}) => {
          if (err) {
            console.log("fetchHistory :: db(historyLength) : エラー->", err);
            resolve(null);
            return;
          } else {
            resolve(length['COUNT(*)']);
            //console.log("fetchHistory :: db(historyLength) : historyLength->", length);
            return;
          }
        }
      );
      return null;
    });
    //もし長さを取得できなかったのならエラーとして停止
    if (historyLength === null) return null;

    //履歴出力
    return await new Promise ((resolve) => {
      db.all(
        `
        SELECT * FROM C` + channelId + `
          ORDER BY time DESC
          LIMIT 30
          OFFSET ` + position + `
        `,
        (err:Error, history:IMessage[]) => {
          if (err) {
            console.log("fetchHistory :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            console.log("fetchHistory :: db : history->", history);
            resolve(history);
            return;
          }
        }
      );
    });

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
          console.log("fetchHistory :: calcPositionOfMessage(db) : data->", messageWithIndex);
          resolve(messageWithIndex.RowNum);
          return;
        }
      }
    );
  });
}
