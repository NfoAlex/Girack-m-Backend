import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import { IMessage, IMessageBeforeParsing } from "../../type/Message";

export default async function fetchHistory(
  channelId: string,
  fetchingPosition: {
    positionMessageId: string
    fetchDirection: "older"|"newer"
  }
):Promise<
  {
    history: IMessage[],
    atTop: boolean,
    atEnd: boolean
  } | null
> {
  try {

    //履歴の取り込み数
    let historyLimit:number = 30;
    //履歴を読み出し始める位置
    let positionIndex:number = 0;

    //メッセージ位置の設定、指定がないなら0
    if (fetchingPosition.positionMessageId !== "") {
      //メッセージのインデックス番号を計算する
      const positionTemp = await calcPositionOfMessage(channelId, fetchingPosition.positionMessageId);

      //結果に応じて値設定
      if (positionTemp === null) {
        //nullなら処理停止
        return null;
      } else {
        //成功なら値を格納
        positionIndex = positionTemp;
      }
    }

    //履歴の長さを取得
    const historyLength:number|null = await new Promise((resolve):number|null => {
      db.all(
        `
        SELECT COUNT(*) FROM C` + channelId + `
        `,
        (err:Error, length:[{"COUNT(*)":number}]) => {
          if (err) {
            console.log("fetchHistory :: db(historyLength) : エラー->", err);
            resolve(null);
            return;
          } else {
            resolve(length[0]['COUNT(*)']);
            //console.log("fetchHistory :: db(historyLength) : historyLength->", length);
            return;
          }
        }
      );
      return null;
    });
    //もし長さを取得できなかったのならエラーとして停止
    if (historyLength === null) return null;

    //履歴取得方向がolderなら取得開始位置を30上にする(時系列的に古く)
    if (fetchingPosition.fetchDirection === "newer") {
      //そもそも30ないなら0にする
      if (positionIndex - 30 < 0) {
        //履歴の取り込み数を開始位置にしてその分だけしかとらないようにする
        historyLimit = positionIndex - 1;
        //履歴を取り始める位置を最初からにするため0に
        positionIndex = 0;
      } else {
        positionIndex = positionIndex - 31;
      }
    }

    //履歴出力
    return await new Promise ((resolve) => {
      db.all(
        `
        SELECT * FROM C` + channelId + `
          ORDER BY time DESC
          LIMIT ` + historyLimit + `
          OFFSET ` + positionIndex + `
        `,
        (err:Error, history:IMessageBeforeParsing[]) => {
          if (err) {
            console.log("fetchHistory :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchHistory :: db : history->", history);
            
            //履歴の先頭あるいは終わりにいるかどうか用変数
            let atTop:boolean = false;
            let atEnd:boolean = false;
            //履歴の長さから取得開始位置を引いて30以内なら末端
            if (historyLength - positionIndex < 30) {
              atTop = true;
            }
            //位置がそもそも30以内なら履歴先頭
            if (positionIndex < 30) {
              atEnd = true;
            }

            //JSONでメッセージパースした用の配列
            let historyParsed:IMessage[] = [];
            //パース処理
            for (let index in history) {
              historyParsed.push({
                ...history[index],
                reaction: JSON.parse(history[index].reaction)
              });
            }

            //最後に返す結果
            resolve({
              history: historyParsed,
              atTop: atTop,
              atEnd: atEnd
            });
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
          ROW_NUMBER() OVER (ORDER BY time DESC) AS RowNum
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
          resolve(messageWithIndex[0].RowNum);
          return;
        }
      }
    );
  });
}
