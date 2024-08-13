import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserInbox } from "../../type/User";

/**
 * ユーザーのInbox(通知)を取得
 * @param _userId 
 * @returns 
 */
export default function fetchUserInbox(_userId: string):IUserInbox|null {
  try {

    //Inboxのデータを取得(この時点ではString)
    const userInbox = db.prepare(
      "SELECT inbox FROM USERS_SAVES WHERE userId=?"
    ).get(_userId) as {inbox: string};

    //Inboxをパース
    const userInboxParsed:IUserInbox = JSON.parse(userInbox.inbox);

    return userInboxParsed;

  } catch(e) {

    console.log("fetchInbox :: エラー->", e);
    return null;

  }
}