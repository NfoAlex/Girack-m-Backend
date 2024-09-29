import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import type { IMessage, IMessageBeforeParsing } from "../../type/Message";

/**
 * メッセージを取得
 * @param _channelId 
 * @param _messageId 
 * @returns 
 */
export default function fetchMessage(
  _historyId: string,
  _messageId: string,
  _isThread: boolean = false,
):IMessage|null {
  try {

    //SQLite構文(スレッドからか、チャンネルからか)
    const stmt = !_isThread ?
      `
      SELECT * FROM C${_historyId}
        WHERE messageId='${_messageId}'
      `
    :
      `
      SELECT * FROM T${_historyId}
        WHERE messageId='${_messageId}'
      `;

    //メッセージの取得
    const msg = db.prepare(
      stmt
    ).get() as IMessageBeforeParsing|undefined;
    //undefinedならnull
    if (msg === undefined) return null;

    //パースする
    const msgParsed:IMessage = {
      ...msg,
      isEdited: msg.isEdited === 1,
      isSystemMessage: msg.isSystemMessage === 1,
      hasThread: msg.hasThread === 1,
      linkData: msg.linkData!==undefined?JSON.parse(msg.linkData):{},
      fileId: msg.fileId!==''?msg.fileId.split(","):[], //空なら''だけなのでこの条件
      reaction: msg.reaction!==undefined?JSON.parse(msg.reaction):{}
    }

    return msgParsed;

  } catch(e) {

    console.log("fetchMessage :: エラー->", e);
    return null;

  }
}
