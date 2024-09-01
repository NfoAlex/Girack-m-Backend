import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

import type { IUserRole, IUserRoleBeforeParsing } from "../../type/User";

/**
 * すべてのロールを取得する
 * @returns 
 */
export default function fetchRoles():IUserRole[] | null {
  try {

    const roles = db.prepare("SELECT * FROM ROLES").all() as IUserRoleBeforeParsing[];

    //変数パース用の配列変数
    const roleDataParsed:IUserRole[] = [];

    for (const role of roles) {
      roleDataParsed.push({
        roleId: role.roleId,
        name: role.name,
        color: role.color,
        ServerManage: role.ServerManage === 1,
        RoleManage: role.RoleManage === 1,
        ChannelManage: role.ChannelManage === 1,
        UserManage: role.UserManage === 1,
        MessageDelete: role.MessageDelete === 1,
        MessageAttatchFile: role.MessageAttatchFile === 1,
        APIUse: role.APIUse === 1
      });
    }

    return roleDataParsed;

  } catch(e) {

    console.log("fetchRoles :: エラー->", e);
    return null;

  }
}
