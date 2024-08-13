import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import roleCheck from "../../util/roleCheck";

/**
 * ユーザーのBAN解除
 * @param _sendersUserId 
 * @param _targetUserId 
 * @returns 
 */
export default function pardonUser(_sendersUserId:string, _targetUserId:string)
:boolean {
  try {

    //権限を確認
    const canPardon = roleCheck(_sendersUserId, "UserManage");
    if (!canPardon) return false;

    //DBへ記録
    db.prepare(
      "UPDATE USERS_INFO SET banned=? WHERE userId=?"
    ).run(0, _targetUserId);

    return true;

  } catch(e) {

    console.log("pardonUser :: エラー->", e);
    return false;

  }
}
