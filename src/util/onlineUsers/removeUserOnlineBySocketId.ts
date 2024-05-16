import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

/**
 * オンラインユーザーリストから一致するSocketIDを
 * 持つユーザーIdを削除し、そのユーザーIdを返す
 * @param socketId 
 * @returns string
 */
export default async function removeUserOnlineBySocketId(socketId:string)
:Promise<string | null> {
  try {

    console.log("removeUserOnlineBySocketId :: socketId->", socketId);

    //切断するユーザーIdを取得
    const userIdDisconnecting:string|null = await new Promise((resolve) => {
      db.all(
        `
        SELECT userId FROM ONLINE_USERS WHERE socketId=?
        `,
        socketId,
        (err:Error, onlineUsers:any[]) => {
          if (err) {
            console.log("removeUserOnlineBySocketId :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //配列の長さを確認して返す、空だったらnull
            if (onlineUsers.length !== 0) {
              resolve(onlineUsers[0]);
            } else {
              resolve(null);
            }
            return;
          }
        }
      );
    });

    //もしユーザーIdがnullだったらそう返して停止
    if (userIdDisconnecting === null) {
      return null;
    }

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

    return userIdDisconnecting;

  } catch(e) {

    console.log("removeUserOnlineBySocketId :: エラー->", e);
    return null;

  }
} 
