import fetchChannel from "./fetchChannel";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * チャンネルを作成する
 * @param channelName 
 * @param description 
 * @param isPrivate 
 * @param userId 
 * @returns 
 */
export default async function createChannel(
    _channelName:string,
    _description:string,
    _isPrivate:boolean,
    _userId:string,
  ):Promise<boolean> {
  try {

    //空いているチャンネルIDを探して取得
    const channelIdGen = await getNewChannelId();
    //IDが空なら失敗として返す
    if (channelIdGen === "") return false;

    //チャンネル用履歴テーブル作成
    db.exec(
      `
      create table if not exists C${channelIdGen}(
        messageId TEXT PRIMARY KEY,
        channelId TEXT NOT NULL,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        isEdited BOOLEAN NOT NULL DEFAULT '0',
        linkData TEXT DEFAULT '{}',
        fileId TEXT NOT NULL,
        time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
        reaction TEXT NOT NULL
      )
      `
    );

    db.prepare(
      `
      INSERT INTO CHANNELS (
        channelId, channelName, description, createdBy, isPrivate, speakableRole
      )
      values (?,?,?,?,?,?)
      `
    ).run(
      channelIdGen,
      _channelName,
      _description,
      _userId,
      _isPrivate?1:0,
      ""
    );

    return true;

  } catch(e) {

    console.log("createChannel :: エラー->", e);
    return false;

  }
}

//チャンネルIDの空きを探す
function getNewChannelId():Promise<string> {
  let tryCount = 0;

  return new Promise<string>((resolve) => {
    try {

      const checkLoop = setInterval(async () => {
        //生成するID
        let channelIdGen = "";
        //4桁分の数字追加してIDにする
        for (let i=0; i<4; i++) {
          channelIdGen += Math.trunc(Math.random() * 9); //乱数を追加
        }
    
        //チャンネル検索、データ格納
        //const datChannel = fetchChannel(channelIdGen, "SYSTEM");
        const datChannel = db.prepare(
          "SELECT * FROM CHANNELS WHERE channelId=?"
        ).get(channelIdGen) as IChannelbeforeParsing|undefined;
        console.log("createChannel :: getNewChannelId : datChannel->", datChannel);
        
        //データ長さが0ならループ停止してIDを返す
        if (datChannel === undefined) {
          clearInterval(checkLoop);
          resolve(channelIdGen); //IDを返す
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

      console.log("createChannel :: getNewChannelId : エラー->", e);
      resolve("");

    }
  });
}
