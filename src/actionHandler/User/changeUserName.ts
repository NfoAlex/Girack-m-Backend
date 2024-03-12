import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

export default async function changeUserName(userId:string, userName:string):Promise<boolean> {
  return new Promise((resolve) => {
    //書き込み更新
    db.run("UPDATE USERS_INFO SET userName=? WHERE userId=?", [userName, userId], (err) => {
      if (err) {
        //エラーを投げる
        throw err;
      } else {
        //成功と返す
        resolve(true);
      }
    });
  });
}
