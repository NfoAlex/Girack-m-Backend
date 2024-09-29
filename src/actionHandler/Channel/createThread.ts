import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');
const dbMsg = new Database('./records/MESSAGE.db');
dbMsg.pragma('journal_mode = WAL');

import type { IThreadbeforeParsing } from "../../type/Channel";

/**
 * スレッドを作成する
 * @param threadName 作成するスレッド名
 * @param channelId スレッドを作るもとのチャンネルId
 * @param parentMessageId スレッドを作るもとのメッセージId
 * @param userId 作成するユーザーのId
 * @returns 
 */
export default async function createThread(
  _threadName: string,
  _channelId: string,
  _parentMessageId: string,
  _userId: string,
):Promise<boolean> {
  try {

    //空いているチャンネルIDを探して取得
    const threadlIdGen = await getNewThreadId();
    //IDが空なら失敗として返す
    if (threadlIdGen === "") return false;

    //チャンネル用履歴テーブル作成
    dbMsg.exec(
      `
      create table T${threadlIdGen}(
        messageId TEXT PRIMARY KEY,
        channelId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        isEdited BOOLEAN NOT NULL DEFAULT '0',
        linkData TEXT DEFAULT '{}',
        fileId TEXT NOT NULL,
        time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
        reaction TEXT NOT NULL,
        hasThread BOOLEAN NOT NULL DEFAULT '0'
      )
      `
    );
    //スレッド情報を挿入
    db.prepare(
      `
      INSERT INTO THREADS (
        threadId, threadName, createdBy, parentChannelId, parentMessageId
      )
      values (?,?,?,?,?)
      `
    ).run(
      threadlIdGen,
      _threadName,
      _userId,
      _channelId,
      _parentMessageId
    );

    return true;

  } catch(e) {

    console.log("createThread :: エラー->", e);
    return false;

  }
}

/**
 * スレッドIDの空きを探す
 * @returns string 使えるスレッドId
 */
function getNewThreadId():Promise<string> {
  let tryCount = 0;

  return new Promise<string>((resolve) => {
    try {

      const checkLoop = setInterval(async () => {
        //生成するID
        let threadIdGen = "";
        //6桁分の数字追加してIDにする
        for (let i=0; i<6; i++) {
          threadIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //スレッド検索、データ格納
        const datThread = db.prepare(
          "SELECT * FROM THREADS WHERE threadId=?"
        ).get(threadIdGen) as IThreadbeforeParsing | undefined;
        //console.log("createChannel :: getNewChannelId : datChannel->", datChannel);
        
        //データ長さが0ならループ停止してIDを返す
        if (datThread === undefined) {
          clearInterval(checkLoop);
          resolve(threadIdGen); //IDを返す
        }
        //10回試しても空きがないなら
        if (tryCount === 10) {
          clearInterval(checkLoop);
          resolve(""); //空で返す
        }
        //試行回数加算
        tryCount++;
      }, 10);

    } catch(e) {

      console.log("createThread :: getNewThreadId : エラー->", e);
      resolve("");

    }
  });
}
