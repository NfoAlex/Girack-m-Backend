import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

import fetchUser from "../User/fetchUser";
import roleCheck from "../../util/roleCheck";

import type { IThread, IThreadbeforeParsing } from "../../type/Channel";

/**
 * スレッド情報を取得する
 * @param _threadId 
 * @param _userId 
 * @returns 
 */
export default function fetchThread(_threadId:string, _userId:string)
:IThread|null {
  try {

    const threadInfo = db.prepare(
      "SELECT * FROM THREADS WHERE threadId=?"
    ).get(_threadId) as IThreadbeforeParsing|undefined;

    if (threadInfo === undefined) return null;

    //ユーザー情報を取得
    const userInfo = fetchUser(_userId, null);
    if (userInfo === null) return null;

    //チャンネル作成者と同じか、あるいはサーバー管理権限があるか調べて違うあるいは無いならnull
    if (
      threadInfo.createdBy !== _userId
      &&
      !(roleCheck(_userId, "ServerManage"))
    ) return null;

    //チャンネル情報をパースする
    const theadInfoParsed:IThread = {
      ...threadInfo,
      speakableRole: //👇空文字列なら空配列にする
        threadInfo.speakableRole!==""?threadInfo.speakableRole.split(","):[]
    }

    return theadInfoParsed;

  } catch(e) {

    console.log("fetchThread :: エラー->", e);
    return null;

  }
}
