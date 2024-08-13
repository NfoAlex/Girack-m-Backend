import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

import calcRoleUser from "./calcRoleUser";
import calcRoleData from "./calcRoleData";

import type { IUserRole } from "../../type/User";

/**
 * ロールデータを更新する
 * @param userId 操作者のユーザーId
 * @param roleData 更新を適用するロールデータ(ロールIdはこの中から参照)
 * @returns 
 */
export default function updateRole(userId:string, roleData:IUserRole)
:boolean {
  try {

    //操作者と更新ロールデータ内容のレベル確認
    const sendersRoleLevel = calcRoleUser(userId);
    const updatingDataRoleLevel = calcRoleData(roleData);

    //console.log("updateRole :: 操作者レベル->", sendersRoleLevel);
    //console.log("updateRole :: 更新するロールのレベル->", updatingDataRoleLevel);

    //もし操作者のロールレベルが追加するロールレベルより低ければ停止
    if (updatingDataRoleLevel > sendersRoleLevel) {
      return false;
    }

    //ロール名は32文字まで、0もだめ
    if (roleData.name.length > 32 || roleData.name.length === 0) {
      return false;
    }

    db.prepare(
      `
      UPDATE ROLES SET
        name=?,
        color=?,
        ServerManage=?,
        RoleManage=?,
        ChannelManage=?,
        UserManage=?,
        MessageDelete=?,
        MessageAttatchFile=?
      WHERE roleId=?
      `
    ).run(
      roleData.name, //名前
      roleData.color, //色
      roleData.ServerManage?1:0, //権限いろいろ...
      roleData.RoleManage?1:0,
      roleData.ChannelManage?1:0,
      roleData.UserManage?1:0,
      roleData.MessageDelete?1:0,
      roleData.MessageAttatchFile?1:0,
      roleData.roleId //指定用のロールID
    );

    return true;

  } catch(e) {

    console.log("updateRole :: エラー->", e);
    return false;

  }
}
