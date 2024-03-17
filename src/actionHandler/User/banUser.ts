import sqlite3 from "sqlite3";
import calcRole from "../Role/calcRole";
const db = new sqlite3.Database("./records/USER.db");

export default async function banUser(sendersUserId:string, targetUserId:string)
:Promise<boolean> {
  try {
    //送信者と標的のロールレベルを取得
    const targetUserRoleLevel = await calcRole(targetUserId);
    const sendersUserRoleLevel = await calcRole(sendersUserId);
    //もし標的者のレベルが送信者より上なら停止
    if (targetUserRoleLevel > sendersUserRoleLevel) {
      return false;
    }

    //書き込み
    return new Promise((resolve) => {
      db.run(
        "UPDATE USERS_INFO SET banned=? WHERE userId=?",
        [true, targetUserId],
        (err) => {
          if (err) {
            console.log("banUser :: db : エラー->", err);
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

    console.log("banUser :: エラー->", e);
    return false;

  }
}
