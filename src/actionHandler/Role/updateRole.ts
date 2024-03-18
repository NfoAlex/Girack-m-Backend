import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");
import calcRoleUser from "./calcRoleUser";
import calcRoleData from "./calcRoleData";

import type { IUserRole } from "../../type/User";

export default async function updateRole(userId:string, roleData:IUserRole)
:Promise<boolean> {
  try {

    //操作者と更新ロールデータ内容のレベル確認
    const sendersRoleLevel = await calcRoleUser(userId);
    const updatingDataRoleLevel = await calcRoleData(roleData);
    console.log("updateRole :: 操作者レベル->", sendersRoleLevel);
    console.log("updateRole :: 更新するロールのレベル->", updatingDataRoleLevel);
    //もし操作者のロールレベルが追加するロールレベルより低ければ停止
    if (updatingDataRoleLevel > sendersRoleLevel) {
      return false;
    }

    //ロール名は32文字まで、0もだめ
    if (roleData.name.length > 32 || roleData.name.length === 0) {
      return false;
    }

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
