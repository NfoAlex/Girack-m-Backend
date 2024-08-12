import fetchChannel from "./fetchChannel";
import roleCheck from "../../util/roleCheck";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * チャンネルを削除する
 * @param _userId 削除する操作元のユーザーId
 * @param _channelId 削除するチャンネルId
 * @returns 
 */
export default async function deleteChannel(
    _userId: string,
    _channelId: string
  ):Promise<boolean> {
  try {

    //チャンネル情報を取得
    const channelInfo = await fetchChannel(_channelId, _userId);
    //無ければ停止
    if (channelInfo === null) return false;

    //チャンネル作成者でない場合権限があるかを確認
    if (channelInfo.createdBy !== _userId) {
      //チャンネル管理のロール権限を確認する
      const roleCheckResult = await roleCheck(_userId, "ChannelManage");
      if (!roleCheckResult) { //falseなら停止
        return false;
      }
    }

    //チャンネルのテーブルを削除
    db.prepare("DELETE FROM CHANNELS WHERE channelId=?").run(_channelId);

    return true;

  } catch(e) {

    console.log("deleteChannel :: エラー->", e);
    return false;

  }
}
