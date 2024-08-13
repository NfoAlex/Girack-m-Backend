import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * ユーザー名を変更する
 * @param _userId 
 * @param _userName 
 * @returns 
 */
export default function changeUserName(_userId:string, _userName:string):boolean {
  try {

    //ユーザー名の変更を記録
    db.prepare("UPDATE USERS_INFO SET userName=? WHERE userId=?").run(_userName, _userId);

    return true;

  } catch(e) {

    console.log("changeUserName : エラー->", e);
    return false;

  }
}
