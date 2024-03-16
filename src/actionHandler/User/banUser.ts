import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

export default async function banUser(sendersUserId:string, targetUserId:string)
:Promise<boolean> {
  try {
    
    // ToDo :: 権限レベルの確認

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
