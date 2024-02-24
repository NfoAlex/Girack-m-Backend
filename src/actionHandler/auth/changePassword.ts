import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../../db/fetchUser";

import { IUserInfo } from "../../type/User";

export default async function changePassword(
  userId:string, currentPasword:string, newPassword:string
):Promise<boolean> {
  return new Promise((resolve) => {
    //データ検索してパスワードを比較
    db.all("SELECT * FROM USERS_INFO WHERE userId=?", [userId], (err, rows:IUserInfo[]) => {
      //エラーならエラーと返す
      if (err) {
        resolve(false);
        throw err;
      }
      //パスワードを比較して違ったら終わらせる
      rows.forEach((data:IUserInfo) => {
        if (data.password !== currentPasword) {
          resolve(false);
          return false;
        }
      })
    });


  });
  
}
