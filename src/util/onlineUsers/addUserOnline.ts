import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

/**
 * オンラインユーザーへユーザーId、SocketIDを追加し結果を返す
 * @param socketId 
 * @param userId 
 * @param sessionId 
 * @returns boolean
 */
export default async function addUserOnline(socketId:string, userId:string, sessionId:string)
:Promise<boolean> {
  try {

    return new Promise((resolve) => {
      db.run(
        `
        INSERT INTO ONLINE_USERS (socketId,userId,sessionId) VALUES (?,?,?)
        `,
        [socketId, userId, sessionId],
        (err:Error) => {
          if (err) {
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

    console.log("addUserOnline :: エラー->", e);
    return false;

  }
}
