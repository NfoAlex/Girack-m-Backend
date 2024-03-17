import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";
import calcRoleUser from "./calcRoleUser";
import calcRoleData from "./calcRoleData";
import fetchRoleSingle from "./fetchRoleSingle";

export default async function unlinkRole(
  sendersUserId: string,
  targetUserId: string,
  roleId: string
):Promise<boolean> {
  try {

    //操作者と外すロールのレベル確認
    const sendersRoleLevel = await calcRoleUser(sendersUserId);
    const unlinkingDataRoleLevel = await calcRoleData(
      await fetchRoleSingle(roleId)
    );
    console.log("unlinkRole :: 操作者レベル->", sendersRoleLevel);
    console.log("unlinkRole :: 外すロールのレベル->", unlinkingDataRoleLevel);
    //もし操作者のロールレベルが外すロールレベルより低ければ停止
    if (unlinkingDataRoleLevel > sendersRoleLevel) {
      return false;
    }

    //ユーザー情報を取得してnullなら停止
    const userInfo = await fetchUser(targetUserId, null);
    if (userInfo === null) return false;
    //ロール配列抜き出し
    const roleArr = userInfo.role;
    
    //ロール配列にロールIDが無いなら停止
    if (!roleArr.includes(roleId)) return false;

    //配列からロールID削除
    roleArr.splice(roleArr.indexOf(roleId), 1);

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
            console.log("unlinkRole :: db : エラー->", err);
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

    console.log("unlinkRole :: エラー->", e);
    return false;

  }
}
