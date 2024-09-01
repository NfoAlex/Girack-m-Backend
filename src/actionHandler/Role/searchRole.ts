import Database from 'better-sqlite3';
const db = new Database('./records/ROLE.db');
db.pragma('journal_mode = WAL');

import type { IUserRole, IUserRoleBeforeParsing } from "../../type/User";

/**
 * ロール検索
 * @param _searchQuery 
 * @param _pageIndex 
 * @returns 
 */
export default function searchRole(_searchQuery:string, _pageIndex:number)
:
  {
    role: IUserRole[],
    pageIndex: number
  }
  |
  null
{
  try {

    //ページ数に合わせて取得するデータをずらす
    const itemOffset = (_pageIndex - 1) * 30;

    //ロール検索結果
    const roles = db.prepare(
      `
      SELECT * FROM ROLES
        WHERE name LIKE ?
        LIMIT 30
        OFFSET ?
      `
    ).all(`%${_searchQuery}%`, itemOffset) as IUserRoleBeforeParsing[];

    //変数パース用の配列変数
    const roleDataParsed:IUserRole[] = [];
    //変数のパース処理
    for (const role of roles) {
      //配列プッシュ
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

    return {role:roleDataParsed, pageIndex:_pageIndex};

  } catch(e) {

    console.log("searchRole :: エラー->", e);
    return null;

  }
}
