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
  _channelId: string,
  _messageId: string
):IMessage|null {
  try {

    //メッセージの取得
    const msg = db.prepare(
      `
      SELECT * FROM C${_channelId}
        WHERE messageId='${_messageId}'
      `
    ).get() as IMessageBeforeParsing|undefined;
    //undefinedならnull
    if (msg === undefined) return null;

    //パースする
    const msgParsed:IMessage = {
      ...msg,
      isEdited: msg.isEdited === 1,
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
