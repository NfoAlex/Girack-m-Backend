import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

export default async function removeUserOnlineBySocketId(socketId:string) {
  try {

    console.log("removeUserOnlineBySocketId :: socketId->", socketId);

    //SocketIDに該当する接続を削除
    db.run(
      `
      DELETE FROM ONLINE_USERS WHERE socketId=?
      `,
      socketId,
      (err:Error, onlineUsers:any[]) => {
        if (err) {
          console.log("removeUserOnlineBySocketId :: db : エラー->, err");
          return;
        }
      }
    );

    return;

  } catch(e) {

    console.log("removeUserOnlineBySocketId :: エラー->", e);
    return;

  }
} 
