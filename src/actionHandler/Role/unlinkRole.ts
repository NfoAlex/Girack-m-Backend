import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import fetchUser from "../User/fetchUser";
import calcRoleUser from "./calcRoleUser";
import calcRoleData from "./calcRoleData";
import fetchRoleSingle from "./fetchRoleSingle";

/**
 * ユーザーから指定のロールを削除
 * @param _sendersUserId 
 * @param _targetUserId 
 * @param _roleId 
 * @returns 
 */
export default function unlinkRole(
  _sendersUserId: string,
  _targetUserId: string,
  _roleId: string
): boolean {
  try {

    //操作者と外すロールのレベル確認
    const sendersRoleLevel = calcRoleUser(_sendersUserId);
    const unlinkingDataRoleLevel = calcRoleData(
      fetchRoleSingle(_roleId)
    );
    console.log("unlinkRole :: 操作者レベル->", sendersRoleLevel);
    console.log("unlinkRole :: 外すロールのレベル->", unlinkingDataRoleLevel);
    //もし操作者のロールレベルが外すロールレベルより低ければ停止
    if (unlinkingDataRoleLevel > sendersRoleLevel) {
      return false;
    }

    //ユーザー情報を取得してnullなら停止
    const userInfo = fetchUser(_targetUserId, null);
    if (userInfo === null) return false;
    //ロール配列抜き出し
    const roleArr = userInfo.role;
    
    //ロール配列にロールIDが無いなら停止
    if (!roleArr.includes(_roleId)) return false;

    //配列からロールID削除
    roleArr.splice(roleArr.indexOf(_roleId), 1);

    //ロール配列をDBへ適用
    db.prepare(
      "UPDATE USERS_INFO SET role=? WHERE userId=?"
    ).run(roleArr.join(","), _targetUserId);

    return true;

  } catch(e) {

    console.log("unlinkRole :: エラー->", e);
    return false;

  }
}
