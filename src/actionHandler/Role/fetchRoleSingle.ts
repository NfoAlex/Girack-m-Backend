import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");

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

export default async function fetchRoleSingle(targetRoleId:string)
:Promise<IUserRole> {
  try {

    return new Promise((resolve) => {
      //ロールデータをすべて取得
      db.all(
        "SELECT * FROM ROLES WHERE roleId=?",
        targetRoleId,
        (err:Error, roleData:IUserRoleBeforeParsing[]) => {
          if (err) {
            resolve(errorRoleHolder);
            return;
          } else {
            if (roleData.length === 0) {
              resolve(errorRoleHolder);
              return;
            }

            //扱える形式へパース
            const roleInfo:IUserRole = {
              ...roleData[0], //名前、色、IDはパース不要
              ServerManage: roleData[0].ServerManage===1?true:false,
              RoleManage: roleData[0].RoleManage===1?true:false,
              ChannelManage: roleData[0].ChannelManage===1?true:false,
              UserManage: roleData[0].UserManage===1?true:false,
              MessageDelete: roleData[0].MessageDelete===1?true:false,
              MessageAttatchFile: roleData[0].MessageAttatchFile===1?true:false
            };
            //返す
            resolve(roleInfo);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("fetchRoleSingle :: エラー->", e);
    return errorRoleHolder;

  }
}
