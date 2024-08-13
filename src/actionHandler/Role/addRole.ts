import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import fetchUser from "../User/fetchUser";
import calcRoleData from "./calcRoleData";
import calcRoleUser from "./calcRoleUser";
import fetchRoleSingle from "./fetchRoleSingle";

/**
 * ユーザーにロールを付与
 * @param _sendersUserId 操作者のユーザーId
 * @param _targetUserId ロールを付与するユーザーId
 * @param _roleId 付与するロールId
 * @returns 
 */
export default function addRole(
  _sendersUserId: string,
  _targetUserId: string,
  _roleId: string
): boolean {
  try {

    //ロールのレベルを計算
    const userRoleLevel = calcRoleUser(_sendersUserId);
    const addingRoleLevel = calcRoleData(
      fetchRoleSingle(_roleId)
    );

    //console.log("addRole :: 操作者レベル->", userRoleLevel);
    //console.log("addRole :: 付与するロールのレベル->", addingRoleLevel);

    //もし操作者のロールレベルが追加するロールレベルより低ければ停止
    if (addingRoleLevel > userRoleLevel) {
      return false;
    }

    //ユーザー情報を取得してnullなら停止
    const userInfo = fetchUser(_targetUserId, null);
    if (userInfo === null) return false;
    //ロール配列抜き出し
    const roleArr = userInfo.role;
    
    //ロール配列にすでに入っているなら停止
    if (roleArr.includes(_roleId)) return false;

    //配列へ追加
    roleArr.push(_roleId);

    //データを更新
    db.prepare(
      "UPDATE USERS_INFO SET role=? WHERE userId=?"
    ).run(roleArr.join(","), _targetUserId);

    return true;

  } catch(e) {

    console.log("addRole :: エラー->", e);
    return false;

  }
}
