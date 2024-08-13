import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import calcRoleUser from "../Role/calcRoleUser";

/**
 * ユーザーをBANする
 * @param sendersUserId 操作者のユーザーId
 * @param targetUserId BANするユーザーId
 * @returns 
 */
export default function banUser(_sendersUserId:string, _targetUserId:string)
:boolean {
  try {
    //送信者と標的のロールレベルを取得
    const targetUserRoleLevel = calcRoleUser(_targetUserId);
    const sendersUserRoleLevel = calcRoleUser(_sendersUserId);
    //もし標的者のレベルが送信者より上なら停止
    if (targetUserRoleLevel > sendersUserRoleLevel) {
      return false;
    }

    //DBへ記録
    db.prepare(
      "UPDATE USERS_INFO SET banned=? WHERE userId=?"
    ).run(1, _targetUserId);

    return true;

  } catch(e) {

    console.log("banUser :: エラー->", e);
    return false;

  }
}
