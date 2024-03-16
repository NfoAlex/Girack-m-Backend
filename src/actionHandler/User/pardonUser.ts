import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

export default async function pardonUser(sendersUserId:string, targetUserId:string)
:Promise<boolean> {
  try {
    
    // ToDo :: 権限レベルの確認

    //書き込み
    return new Promise((resolve) => {
      db.run(
        "UPDATE USERS_INFO SET banned=? WHERE userId=?",
        [false, targetUserId],
        (err) => {
          if (err) {
            console.log("pardonUser :: db : エラー->", err);
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

    console.log("pardonUser :: エラー->", e);
    return false;

  }
}
