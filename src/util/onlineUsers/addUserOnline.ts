import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

export default async function addUserOnline(socketId:string, userId:string, sessionId:string):Promise<boolean> {
  try {

    return new Promise((resolve) => {
      db.run(
        `
        INSERT INTO ONLINEUSERS (socketId,userId,sessionId) VALUES (?,?,?)
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
