import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import type { IMessage, IMessageBeforeParsing } from "../../type/Message";

/**
 * 履歴を取得する
 * @param _channelId 
 * @param _fetchingPosition 
 * @returns 
 */
export default function fetchHistory(
  _channelId: string,
  _fetchingPosition: {
    positionMessageId?: string
    positionMessageTime?: string
    includeThisPosition: boolean,
    fetchDirection: "older"|"newer"
  }
):
  {
    history: IMessage[],
    atTop: boolean,
    atEnd: boolean
  } | null
 {
  try {

    //履歴の取り込み数
    let historyLimit = 30;
    //履歴を読み出し始める位置
    let positionIndex = 0;

    //メッセージ位置の設定、指定がないなら0
    if (
      ( //Idの指定があるか？
        _fetchingPosition.positionMessageId !== "" && _fetchingPosition.positionMessageId !== undefined
      )
      ||
      ( //または時間の指定があるか？
        _fetchingPosition.positionMessageTime !== "" && _fetchingPosition.positionMessageTime !== undefined
      )
    ) {
      //メッセージのインデックス番号を計算する
      const positionTemp = calcPositionOfMessage(
        _channelId,
        {
          messageId: _fetchingPosition.positionMessageId,
          time: _fetchingPosition.positionMessageTime
        }
      );

      //結果に応じて値設定
      if (positionTemp === null) {
        //nullなら処理停止
        return null;
      }
      
      positionIndex = positionTemp;

      //もし取得はじめの位置も履歴に含めるならpositionIndexをずらす
      if (_fetchingPosition.includeThisPosition) {
        if (_fetchingPosition.fetchDirection === "newer") {
          positionIndex += 1;
        } else {
          positionIndex =
            positionIndex-1 < 0 ? 0 : positionIndex-1;
        }
      }
    }

    //履歴の長さを取得
    const historyLengthRaw = db.prepare(
      `SELECT COUNT(*) FROM C${_channelId}`
    ).get() as {"COUNT(*)":number};
    const historyLength = historyLengthRaw["COUNT(*)"];

    //履歴取得方向がnewerなら取得開始位置を30上にする(時系列的に古く)
    if (_fetchingPosition.fetchDirection === "newer") {
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

    /////////////////////////////////////////////
    // ここから履歴の取得、位置計算
    /////////////////////////////////////////////

    //履歴取得
    const history = db.prepare(
      `
      SELECT * FROM C${_channelId}
        ORDER BY time DESC
        LIMIT ${historyLimit}
        OFFSET ${positionIndex}
      `
    ).all() as IMessageBeforeParsing[];

    //履歴の先頭あるいは終わりにいるかどうか用変数
    let atTop = false;
    let atEnd = false;
    //履歴の長さから取得開始位置を引いて30以内なら末端
    if (historyLength - positionIndex < 30) {
      atTop = true;
    }

    ////  ↓最新履歴位置にいるか計算  ////
    //新しい方に履歴を取得している場合
    if (_fetchingPosition.fetchDirection === "newer") {
      //取得開始位置が0なら最新
      if (positionIndex === 0) {
        atEnd = true;
      }
    } else { //古い方を取っている場合
      //もし取得位置も含めてメッセージをとっていて0なら最新
      if (
        _fetchingPosition.includeThisPosition
          &&
        positionIndex === 0
      ) {
        atEnd = true;
      }
    }
    ////  ↑最新履歴位置にいるか計算ここまで  ////

    //JSONで履歴をパースした用の配列
    const historyParsed:IMessage[] = [];
    //履歴のパース処理
    for (const index in history) {
      //リンクプレビューのJSONパース、nullかundefinedなら空JSONに
      const linkDataParsed:IMessage["linkData"] =
        (history[index].linkData!==null && history[index].linkData!==undefined)
          ?
            JSON.parse(history[index].linkData)
              :
            {};

      historyParsed.push({
        ...history[index],
        isEdited: history[index].isEdited === 1,
        isSystemMessage: history[index].isSystemMessage === 1,
        hasThread: history[index].hasThread === 1,
        linkData: linkDataParsed,
        fileId: history[index].fileId===''?[]:history[index].fileId.split(","),
        reaction: JSON.parse(history[index].reaction)
      });
    }

    return {
      history: historyParsed,
      atTop: atTop,
      atEnd: atEnd
    };

  } catch(e) {

    console.log("fetchHistory :: エラー->", e);
    return null;

  }
}

/**
 * メッセージの位置を取得
 * @param _channelId 
 * @param _messagePos 
 * @returns 
 */
function calcPositionOfMessage(
  _channelId:string,
  _messagePos: {
    messageId?: string,
    time?: string
  }
):number|null {
  try {

    //位置計算に使うメッセージ情報
    let calcMode:"messageId"|"time" = "messageId";
    //引数に時間があるかで使う情報切り替え
    if (_messagePos.time !== undefined) {
      calcMode = "time";
    }

    //console.log("fetchHistory :: calcPositionOfMessage : calcMode->", calcMode);

    //検索に使うSQL構文を選択(時間かメッセIdか)
    const searchQuery = calcMode==="messageId"
      ?
        `messageId = '${_messagePos.messageId}'`
      :
        `time = '${_messagePos.time}'`

    //RowNumとメッセのInterfaceを結合したものを作る
    interface IRowNum {RowNum: number};
    interface IMessageBeforeParsingWithRowNum extends IMessageBeforeParsing, IRowNum {};

    //履歴の位置を計算
    const dbResultCalcPosition = db.prepare(
      `
      WITH NumberedRows AS (
        SELECT
          *,
          ROW_NUMBER() OVER (ORDER BY time DESC) AS RowNum
        FROM
          C${_channelId}
      )
      SELECT
        *
      FROM
        NumberedRows
      WHERE
        ${searchQuery};
      `
    ).get() as IMessageBeforeParsingWithRowNum;

    return dbResultCalcPosition.RowNum;

  } catch(e) {

    return null;

  }
}
