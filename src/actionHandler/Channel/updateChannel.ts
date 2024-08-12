import roleCheck from "../../util/roleCheck";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');


import type { IChannel } from "../../type/Channel";

/**
 * チャンネルの情報を更新する
 * @param _userId 操作元のユーザーId
 * @param _channelId 対象のチャンネルId
 * @param _channelInfo 適用するチャンネル情報
 * @returns 
 */
export default async function updateChannel(
  _userId: string,
  _channelId: string,
  _channelInfo: IChannel
):Promise<boolean> {
  try {

    //チャンネル編集権限があるか調べて、なければfalse
    const resultRoleCheck = await roleCheck(_userId, "ChannelManage");
    if (!resultRoleCheck) return false;

    db.prepare(
      `
      UPDATE CHANNELS SET
        channelName=?,
        description=?,
        isPrivate=?,
        speakableRole=?
      WHERE channelId=?
      `
    ).run(
      _channelInfo.channelName,
      _channelInfo.description,
      _channelInfo.isPrivate?1:0,
      _channelInfo.speakableRole.join(),
      _channelId
    );

    return true;

  } catch(e) {

    console.log("updateChannel :: エラー->", e);
    return false;

  }
}
