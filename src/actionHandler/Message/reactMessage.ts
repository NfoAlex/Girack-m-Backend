import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import fetchMessage from "./fetchMessage";

/**
 * メッセージへリアクションを追加
 * @param _channelId 
 * @param _messageId 
 * @param _reactionName 
 * @param _userId 
 * @returns 
 */
export default async function reactMessage(
  _channelId: string,
  _messageId: string,
  _reactionName: string,
  _userId: string
):Promise<boolean> {
  try {

    //メッセージ情報を取得
    const message = await fetchMessage(_channelId, _messageId);
    //もしメッセージがnullなら停止
    if (message === null) return false;

    //もしそもそも対象のリアクションデータが空なら新しく作る
    if (message.reaction[_reactionName] === undefined) {
      //空のを作る
      message.reaction[_reactionName] = {};
      //このユーザーID分のリアクション数を設定
      message.reaction[_reactionName][_userId] = 1;
    } else {
      //このユーザーIDによるリアクション数を取得
      const reactionNumberByThisUser:number|undefined = message.reaction[_reactionName][_userId];

      //リアクションJSONへ追加(取得してundefinedなら0に)
      message.reaction[_reactionName][_userId] =
        reactionNumberByThisUser===undefined ? 0 : reactionNumberByThisUser+1;
    }

    //DBへ書き込む
    db.prepare(
      `
      UPDATE C${_channelId} SET
        reaction=?
      WHERE messageId='${_messageId}'
      `
    ).run(JSON.stringify(message.reaction));

    return true;

  } catch(e) {
    
    console.log("reactMessage :: エラー->", e);
    return false;

  }
}
