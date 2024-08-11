import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserPassword } from "../../type/User";

export default function changePassword(
  _userId:string, _currentPasword:string, _newPassword:string
):boolean {
  try {

    //認証結果保存用
    let authResult = false;

    //データ検索してパスワードを比較
    authResult = checkPassword(_userId, _currentPasword);

    //console.log("changePassword :: authResult->", authResult);

    //認証できたならパスワード変更
    if (authResult) {
      db.prepare(
        "UPDATE USERS_PASSWORD SET password=? WHERE userId=?"
      ).run(_newPassword, _userId);

      return true;
    }

    return false;

  } catch(e) {

    console.log("changePassword :: changePassword : エラー->", e);
    return false;

  }
}

/**
 * 現在のパスワードを確認する
 * @param _userId 
 * @param _currentPassword 
 * @returns 
 */
function checkPassword(_userId:string, _currentPassword:string):boolean {
  const passwordData = db.prepare(
    "SELECT * FROM USERS_PASSWORD WHERE userId=?"
  ).get(_userId) as IUserPassword|undefined;
  //パスワードデータがundefinedか、あるいは違うかを確認
  if (passwordData === undefined) return false;
  if (passwordData.password !== _currentPassword) return false;

  return true;
}
