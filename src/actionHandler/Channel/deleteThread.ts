import fetchChannel from "./fetchChannel";
import roleCheck from "../../util/roleCheck";

import Database from 'better-sqlite3';
import fetchThread from "./fetchThread";
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * スレッドを削除する
 * @param _userId 削除する操作元のユーザーId
 * @param _threadId 削除するスレッドId
 * @returns 
 */
export default function deleteThread(
    _userId: string,
    _threadId: string
  ):boolean {
  try {

    //チャンネル情報を取得
    const threadInfo = fetchThread(_threadId, _userId);
    //無ければ停止
    if (threadInfo === null) return false;

    //チャンネル作成者でない場合権限があるかを確認
    if (threadInfo.createdBy !== _userId) {
      //チャンネル管理のロール権限を確認する
      const roleCheckResult = roleCheck(_userId, "ChannelManage");
      if (!roleCheckResult) { //falseなら停止
        return false;
      }
    }

    //スレッドの情報を削除
    db.prepare("DELETE FROM THREADS WHERE threadId=?").run(_threadId);

    return true;

  } catch(e) {

    console.log("deleteThread :: エラー->", e);
    return false;

  }
}
