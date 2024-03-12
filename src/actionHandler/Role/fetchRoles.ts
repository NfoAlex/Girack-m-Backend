import sqlite3 from "sqlite3";
import { IUserRole, IUserRoleBeforeParsing } from "../../type/User";
const db = new sqlite3.Database("./records/ROLE.db");

export default async function fetchRoles():Promise<IUserRole[] | null> {
  try {

    return new Promise((resolve) => {
      //ロールデータをすべて取得
      db.all("SELECT * FROM ROLES", (err:Error, roleData:IUserRoleBeforeParsing[]) => {
        if (err) {
          resolve(null);
          return;
        } else {
          //変数パース用の配列変数
          let roleDataParsed:IUserRole[] = [];
          //変数のパース処理
          for (let role of roleData) {
            //配列プッシュ
            roleDataParsed.push({
              roleId: role.roleId,
              name: role.name,
              color: role.color,
              ServerManage: role.ServerManage===1?true:false,
              RoleManage: role.RoleManage===1?true:false,
              ChannelRename: role.ChannelRename===1?true:false,
              ChannelViewPrivate: role.ChannelViewPrivate===1?true:false,
              ChannelCreateAndDelete: role.ChannelCreateAndDelete===1?true:false,
              UserManage: role.UserManage===1?true:false,
              MessageDelete: role.MessageDelete===1?true:false,
              MessageAttatchFile: role.MessageAttatchFile===1?true:false
            });
          }
          resolve(roleDataParsed);
          return;
        }
      });
    });

  } catch(e) {

    console.log("fetchRoles :: エラー->", e);
    return null;

  }
}
