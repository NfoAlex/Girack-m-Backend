import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");
import fetchUser from "../User/fetchUser";

import { IUserInfo, IUserPassword } from "../../type/User";

export default async function changePassword(
  userId:string, currentPasword:string, newPassword:string
):Promise<boolean> {
  return new Promise(async (resolve) => {
    try {

      //認証結果保存用
      let authResult:boolean = false;

      //データ検索してパスワードを比較
      authResult = await checkPassword(userId, currentPasword);

      //console.log("changePassword :: authResult->", authResult);

      //認証できたならパスワード変更
      if (authResult) {
        //パスワードを変更
        db.run("UPDATE USERS_PASSWORD SET password=? WHERE userId=?", [newPassword, userId], (err) => {
          if (err) {
            //エラーを投げる
            throw err;
          } else {
            //成功と返す
            resolve(true);
            return;
          }
        });
      } else { //失敗ならそう返す
        resolve(false);
        return;
      }

    } catch(e) {

      console.log("changePassword :: changePassword : エラー->", e);
      resolve(false);
      return;

    }
  });
}

//現在のパスワード確認用処理
async function checkPassword(userId:string, currentPassword:string):Promise<boolean> {
  return new Promise((resolve) => {
    db.all("SELECT * FROM USERS_PASSWORD WHERE userId=?", [userId], (err, datUser:IUserPassword[]) => {
      //エラーならエラーと返す
      if (err) {
        resolve(false);
        throw err;
      }
      //パスワードを比較して違ったら終わらせる
      if (datUser[0].password !== currentPassword) {
        resolve(false);
        return; //認証失敗
      } else {
        resolve(true);
        return; //認証成功
      }
    });
  });
}
