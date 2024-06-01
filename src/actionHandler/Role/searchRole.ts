import sqlite3 from "sqlite3";
import { IUserRole, IUserRoleBeforeParsing } from "../../type/User";
const db = new sqlite3.Database("./records/ROLE.db");

export default function searchRole(searchQuery:string, pageIndex:number)
:Promise<
  {
    role: IUserRole[],
    pageIndex: number
  }
>|null{
  try {

    //ページ数に合わせて取得するデータをずらす
    const itemOffset = (pageIndex - 1) * 30;

    return new Promise((resolve) => {
      //ユーザー名でクエリが含まれるものを取得
      db.all(
        `
        SELECT * FROM ROLES
          WHERE name LIKE ?
          LIMIT 30
          OFFSET ?
        `,
        ["%" + searchQuery + "%", itemOffset],
        (err:Error, datRole:IUserRoleBeforeParsing[]) => {
          if (err) {
            console.log("searchRole :: db(エラー) ->", err);
            resolve({role:[], pageIndex:1});
          } else {
            //変数パース用の配列変数
            let roleDataParsed:IUserRole[] = [];
            //変数のパース処理
            for (let role of datRole) {
              //配列プッシュ
              roleDataParsed.push({
                roleId: role.roleId,
                name: role.name,
                color: role.color,
                ServerManage: role.ServerManage===1?true:false,
                RoleManage: role.RoleManage===1?true:false,
                ChannelManage: role.ChannelManage===1?true:false,
                UserManage: role.UserManage===1?true:false,
                MessageDelete: role.MessageDelete===1?true:false,
                MessageAttatchFile: role.MessageAttatchFile===1?true:false
              });
            }
            //パースしたものを返す
            resolve({role:roleDataParsed, pageIndex:pageIndex});
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("searchRole :: エラー->", e);
    return null;

  }
}
