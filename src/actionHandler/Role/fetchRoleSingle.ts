import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

import type { IUserRole, IUserRoleBeforeParsing } from "../../type/User";

//ロール情報がなかったりエラーが起こったりした用に返すロール情報
const errorRoleHolder:IUserRole = {
  roleId: "ERROR",
  name: "エラー",
  color: "#f00",
  ServerManage: false,
  RoleManage: false,
  ChannelManage: false,
  UserManage: false,
  MessageDelete: false,
  MessageAttatchFile: false
};

/**
 * ロール情報を単体で取得する
 * @param _targetRoleId 
 * @returns 
 */
export default async function fetchRoleSingle(_targetRoleId:string)
:Promise<IUserRole> {
  try {

    //ロールを取得
    const role = db.prepare("SELECT * FROM ROLES WHERE roleId=?").get(_targetRoleId) as IUserRoleBeforeParsing|undefined;
    if (role === undefined) return errorRoleHolder;

    //ロールをパース
    const roleParsed:IUserRole = {
      ...role, //名前、色、IDはパース不要
      ServerManage: role.ServerManage === 1,
      RoleManage: role.RoleManage === 1,
      ChannelManage: role.ChannelManage === 1,
      UserManage: role.UserManage === 1,
      MessageDelete: role.MessageDelete === 1,
      MessageAttatchFile: role.MessageAttatchFile === 1
    };

    return roleParsed;

  } catch(e) {

    console.log("fetchRoleSingle :: エラー->", e);
    return errorRoleHolder;

  }
}
