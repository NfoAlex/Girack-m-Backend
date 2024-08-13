import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserInfo, IUserInfoBeforeParsing } from "../../type/User";

/**
 * ユーザー検索
 * @param _userId 
 * @param _username 
 * @returns 
 */
export default function fetchUser(_userId:string|null, _username:string|null)
:IUserInfo|null {
  try {

    //ユーザーIDが引数に無かったらユーザー名で検索する
    if (_userId === null) {
      const userInfo = db.prepare(
        "SELECT * FROM USERS_INFO WHERE userName = ?"
      ).get(_username) as IUserInfo|undefined;

      if (userInfo !== undefined) {
        return userInfo;
      }

      return null;
    }

    const userInfo = db.prepare(
      "SELECT * FROM USERS_INFO WHERE userId = ?"
    ).get(_userId) as IUserInfoBeforeParsing|undefined;

    if (userInfo !== undefined) {
      //パースして返す
      const userInfoParsed:IUserInfo = {
        ...userInfo,
        channelJoined: userInfo.channelJoined.split(","),
        role: userInfo.role.split(","),
        banned: userInfo.banned===1
      };
      return userInfoParsed;
    }

    return null;

  } catch(e) {

    console.log("fetchUser :: エラー->", e);
    return null;

  }
}
