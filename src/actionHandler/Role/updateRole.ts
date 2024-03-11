import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");

import type { IUserRole } from "../../type/User";

export default async function updateRole(userId:string, roleData:IUserRole)
:Promise<boolean> {
  try {

    // ToDo :: ロールの確認(つけられる権限の制限)

    return new Promise((resolve) => {
      //更新
      db.run(
        `
        UPDATE ROLES SET
          name=?,
          color=?,
          ServerManage=?,
          RoleManage=?,
          ChannelRename=?,
          ChannelViewPrivate=?,
          ChannelCreateAndDelete=?,
          UserManage=?,
          MessageDelete=?,
          MessageAttatchFile=?
        WHERE roleId=?
        `,
        [
          roleData.name, //名前
          roleData.color, //色
          roleData.ServerManage, //権限いろいろ...
          roleData.RoleManage,
          roleData.ChannelRename,
          roleData.ChannelViewPrivate,
          roleData.ChannelCreateAndDelete,
          roleData.UserManage,
          roleData.MessageDelete,
          roleData.MessageAttatchFile,
          roleData.roleId //指定用のロールID
        ], (err:Error) => {
          if (err) {
            console.log("updateRole :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("updateRole :: エラー->", e);
    return false;

  }
}
