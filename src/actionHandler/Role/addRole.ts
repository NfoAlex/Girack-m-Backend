import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";
import calcRoleData from "./calcRoleData";
import calcRoleUser from "./calcRoleUser";
import fetchRoleSingle from "./fetchRoleSingle";

export default async function addRole(
  sendersUserId: string,
  targetUserId: string,
  roleId: string
):Promise<boolean> {
  try {

    //ロールのレベルを計算
    const userRoleLevel = await calcRoleUser(sendersUserId);
    const addingRoleLevel = await calcRoleData(
      await fetchRoleSingle(roleId)
    );
    console.log("addRole :: 操作者レベル->", userRoleLevel);
    console.log("addRole :: 付与するロールのレベル->", addingRoleLevel);
    //もし操作者のロールレベルが追加するロールレベルより低ければ停止
    if (addingRoleLevel > userRoleLevel) {
      return false;
    }

    //ユーザー情報を取得してnullなら停止
    const userInfo = await fetchUser(targetUserId, null);
    if (userInfo === null) return false;
    //ロール配列抜き出し
    const roleArr = userInfo.role;
    
    //ロール配列にすでに入っているなら停止
    if (roleArr.includes(roleId)) return false;

    //配列へ追加
    roleArr.push(roleId);

    //DB処理
    return new Promise(async (resolve) => {
      db.run(
        "UPDATE USERS_INFO SET role=? WHERE userId=?",
        [
          roleArr.join(","), //更新した参加チャンネル配列
          targetUserId //参加するユーザーID
        ],
        (err) => {
          if (err) {
            console.log("addRole :: db : エラー->", err);
            //エラーなら失敗
            resolve(false);
            return;
          } else {
            //無事なら成功
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("addRole :: エラー->", e);
    return false;

  }
}
