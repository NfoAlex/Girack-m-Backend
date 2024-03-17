import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

import { IUserInfo, IUserInfoBeforeParsing } from "../../type/User";

export default async function fetchUser(userId:string|null, username:string|null)
:Promise<IUserInfo|null> {
  return new Promise<IUserInfo|null>((resolve) => {
    //ユーザーIDが引数に無かったらIDで検索する
    if (userId === null) {
      //ユーザーを名前で検索
      db.all("SELECT * FROM USERS_INFO WHERE userName = ?", [username], (err:Error, datUser:IUserInfoBeforeParsing[]) => {
        if (err) {
          console.log("fetchUser(userName) :: ERROR ->", err);
          resolve(null);
        } else {
          //console.log("fetchUser(userName) :: 検索結果->", username, datUser);
          //そもそも結果が無いならそう返す
          if (datUser.length === 0) {
            console.log("fetchUser(userName) :: ERROR -> データが空");
            resolve(null);
            return;
          }

          //console.log("fetchUser(userName) :: データ長->", datUser.length);

          //ユーザー情報を取得して利用できるに整備
          let datUserParsed:IUserInfo = {
            userId: datUser[0].userId,
            userName: datUser[0].userName,
            role: datUser[0].role.split(","),
            channelJoined: datUser[0].channelJoined.split(","),
            loggedin: datUser[0].loggedin===1?true:false,
            banned: datUser[0].banned===1?true:false
          };

          //ユーザー情報を返す
          resolve(datUserParsed);
        }
      });
    } else {
      //ユーザーをIDで検索
      db.all("SELECT * FROM USERS_INFO WHERE userId = ?", [userId], (err:Error, datUser:IUserInfoBeforeParsing[]) => {
        if (err) {
          console.log("fetchUser(userId) :: ERROR ->", err);
          resolve(null);
        } else {
          //console.log("fetchUser(userId) :: 検索結果->", userId, datUser);
          //そもそも結果が無いならそう返す
          if (datUser.length === 0) {
            console.log("fetchUser(userId) :: ERROR -> データが空");
            resolve(null);
            return;
          }

          //ユーザー情報を取得して利用できるに整備
          let datUserParsed:IUserInfo = {
            userId: datUser[0].userId,
            userName: datUser[0].userName,
            role: datUser[0].role.split(","),
            channelJoined: datUser[0].channelJoined.split(","),
            loggedin: datUser[0].loggedin===1?true:false,
            banned: datUser[0].banned===1?true:false
          };

          //ユーザー情報を返す
          resolve(datUserParsed);
        }
      });
    }
  });
}
