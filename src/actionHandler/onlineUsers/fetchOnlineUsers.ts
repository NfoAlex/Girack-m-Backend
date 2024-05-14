import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

export default async function fetchOnlineUsers() {
  try {

    //オンラインのユーザーを取得
    const onlineUsers = new Promise((resolve) => {
      db.run(
        `
        SELECT userId from ONLINEUSERS
        `,
        (err:Error, onlineUsers:string[]) => {
          if (err) {
            resolve(null);
            return;
          } else {
            resolve(onlineUsers);
            return;
          }
        }
      )
    });

    //返す
    return onlineUsers;

  } catch(e) {

    console.log("fetchOnlineUsers :: エラー->", e);
    return null;

  }
}
