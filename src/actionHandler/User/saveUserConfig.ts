import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserConfig } from "../../type/User";

/**
 * ユーザーの設定を保存する
 * @param userId 
 * @param datConfig 
 * @returns 
 */
export default function saveUserConfig(_userId:string, _datConfig:IUserConfig):boolean {
  try {

    //設定をDBへ記録
    db.prepare(
      `
      UPDATE USERS_CONFIG SET
        notification=?, theme=?, channel=?, sidebar=?
      WHERE userId=?
      `
    ).run(
      JSON.stringify(_datConfig.notification),
      _datConfig.theme,
      JSON.stringify(_datConfig.channel),
      JSON.stringify(_datConfig.sidebar),
      _userId //書き込み先のユーザーID
    );

    return true;
    
  } catch(e) {

    console.log("saveUserConfig :: エラー->", e);
    return false;

  }
}
