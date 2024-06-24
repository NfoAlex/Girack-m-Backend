import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import { IMessage, IMessageBeforeParsing } from "../../type/Message";

export default async function fetchHistory(
  channelId: string,
  fetchingPosition: {
    positionMessageId?: string
    positionMessageTime?: string
    includeThisPosition: boolean,
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
    if (
      ( //Idの指定があるか？
        fetchingPosition.positionMessageId !== "" && fetchingPosition.positionMessageId !== undefined
      )
      ||
      ( //または時間の指定があるか？
        fetchingPosition.positionMessageTime !== "" && fetchingPosition.positionMessageTime !== undefined
      )
    ) {
      //メッセージのインデックス番号を計算する
      const positionTemp = await calcPositionOfMessage(
        channelId,
        {
          messageId: fetchingPosition.positionMessageId,
          time: fetchingPosition.positionMessageTime
        }
      );

      //結果に応じて値設定
      if (positionTemp === null) {
        //nullなら処理停止
        return null;
      } else {
        //成功なら値を格納
        positionIndex = positionTemp;
      }

      //もし取得はじめの位置も履歴に含めるならpositionIndexをずらす
      if (fetchingPosition.includeThisPosition) {
        if (fetchingPosition.fetchDirection === "newer") {
          positionIndex += 1;
        } else {
          positionIndex =
            positionIndex-1 < 0 ? 0 : positionIndex-1;
        }
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
            console.log("fetchHistory :: db(履歴の長さ取得) : エラー->", err);
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

    //履歴取得方向がnewerなら取得開始位置を30上にする(時系列的に古く)
    if (fetchingPosition.fetchDirection === "newer") {
      //そもそも30ないなら0にする
      if (positionIndex - 30 < 0) {
        //履歴の取り込み数を開始位置にしてその分だけしかとらないようにする
        historyLimit = positionIndex - 1;
        if (historyLimit < 0) historyLimit = 0; //あと0未満なら0
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
            console.log("fetchHistory :: db(履歴取得) : エラー->", err);
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
            ////  ↓atEnd計算  ////
            //新しい方に履歴を取得している場合
            if (fetchingPosition.fetchDirection === "newer") {
              //取得開始位置が0なら最新
              if (positionIndex === 0) {
                atEnd = true;
              }
            } else { //古い方を取っている場合
              //もし取得位置も含めてメッセージをとっていて0なら最新
              if (
                fetchingPosition.includeThisPosition
                  &&
                positionIndex === 0
              ) {
                atEnd = true;
              }
            }
            ////  ↑atEnd計算ここまで  ////

            //console.log("fetchHistory :: db : atTop?->", historyLength - positionIndex);

            //JSONでメッセージパースした用の配列
            let historyParsed:IMessage[] = [];
            //パース処理
            for (let index in history) {
              //リンクプレビューのJSONパース、nullかundefinedなら空JSONに
              const linkDataParsed:IMessage["linkData"] =
                (history[index].linkData!==null && history[index].linkData!==undefined)
                  ?
                    JSON.parse(history[index].linkData)
                      :
                    {};

              historyParsed.push({
                ...history[index],
                linkData: linkDataParsed,
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
async function calcPositionOfMessage(
  channelId:string,
  messagePos: {
    messageId?: string,
    time?: string
  }
):Promise<number|null> {
  return await new Promise((resolve) => {
    try {

      //位置計算に使うメッセージ情報
      let calcMode:"messageId"|"time" = "messageId";
      //引数に時間があるかで使う情報切り替え
      if (messagePos.time !== undefined) {
        calcMode = "time";
      }

      //console.log("fetchHistory :: calcPositionOfMessage : calcMode->", calcMode);

      //検索に使うSQL構文を選択(時間かメッセIdか)
      const searchQuery = calcMode==="messageId"
        ?
          "messageId = '" + messagePos.messageId + "'"
        :
          "time = '" + messagePos.time + "'"

      //該当メッセージの位置取得
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
          ${searchQuery};
        `,
        (err:Error, messageWithIndex:any) => {
          if (err) {
            console.log("fetchHistory :: db(メッセ位置計算) : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchHistory :: calcPositionOfMessage(db) : data->", messageWithIndex);
            //もし長さが0じゃないならそれを返す
            if (messageWithIndex.length === 0) {
              resolve(null);
            } else {
              resolve(messageWithIndex[0].RowNum);
            }
            return;
          }
        }
      );

    } catch(e) {

      resolve(null);
      return;

    }
  });
}
