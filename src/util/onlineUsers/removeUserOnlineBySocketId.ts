import sqlite3 from "sqlite3";
import { IUserInfo } from "../../type/User";
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
        (err:Error, onlineUsers:IUserInfo[]) => {
          if (err) {
            console.log("removeUserOnlineBySocketId :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //配列の長さを確認して返す、空だったらnull
            if (onlineUsers.length !== 0) {
              resolve(onlineUsers[0].userId);
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

    //切断処理とそのユーザーがまだいるかどうか判断処理
    return new Promise((resolve) => {
      db.serialize(() => {
        //SocketIDに該当する接続を削除
        db.run(
          `
          DELETE FROM ONLINE_USERS WHERE socketId=?
          `,
          socketId,
          (err:Error, onlineUsers:any[]) => {
            if (err) {
              console.log("removeUserOnlineBySocketId :: db(DELETE socketId) : エラー->, err");
              return;
            }
          }
        );

        //切断するユーザーIdのSocket数を調べて0なら切断したと送信
        db.all(
          `
          SELECT COUNT(*) FROM ONLINE_USERS WHERE userId=?
          `,
          userIdDisconnecting,
          (err:Error, onlineUsersNum:{"COUNT(*)":number}[]) => {
            if (err) {
              console.log("removeUserOnlineBySocketId :: db(COUNT(*)) : エラー->", err);
            } else {
              console.log("removeUserOnlineBySocketId :: db(COUNT(*)) : カウント->", onlineUsersNum);
              //ここで接続数調べ
              if (onlineUsersNum[0]['COUNT(*)'] === 0) {
                resolve(userIdDisconnecting);
                return;
              } else {
                resolve(null);
                return;
              }
            }
          }
        );

      });
    });

  } catch(e) {

    console.log("removeUserOnlineBySocketId :: エラー->", e);
    return null;

  }
} 
