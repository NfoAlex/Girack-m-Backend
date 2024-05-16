import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

export default async function fetchOnlineUsers():Promise<string[]|null> {
  try {

    //オンラインのユーザーを取得
    return new Promise((resolve) => {
      db.all(
        `
        SELECT userId from ONLINE_USERS
        `,
        (err:Error, onlineUsers:{userId:string}[]) => {
          if (err) {
            resolve(null);
            return;
          } else {
            console.log("fetchOnlineUser :: db : onlineUsers->", onlineUsers);
            //取得結果を配列にする
            const onlineUsersArr:string[] = [];
            for (let userId of onlineUsers) {
              onlineUsersArr.push(userId["userId"]);
            }

            resolve(onlineUsersArr);
            return;
          }
        }
      )
    });

  } catch(e) {

    console.log("fetchOnlineUsers :: エラー->", e);
    return null;

  }
}
