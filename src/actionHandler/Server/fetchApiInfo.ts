import type { IAPIClientInfo, IAPIClientInfoBeforeParsing } from "../../type/Server";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * ユーザーのAPI利用情報を取得する
 */
export default function fetchApiInfo(_userId: string):IAPIClientInfo[]|null {
  try {

    //ここで取得
    const apiClientInfo = db.prepare(
      "SELECT * FROM API_CLIENTS WHERE createdBy=?"
    ).all(_userId) as IAPIClientInfoBeforeParsing[] | undefined;
    
    if (apiClientInfo === undefined) return null;

    //データを扱える形にパースする
    const apiClientInfoParsed:IAPIClientInfo[] = [];
    for (const index in apiClientInfo) {
      apiClientInfoParsed.push({
        ...apiClientInfo[index],
        isEnabled: apiClientInfo[index].isEnabled === 1
      });
    }
    
    return apiClientInfoParsed;

  } catch(e) {

    console.log("fetchApiInfo :: エラー->", e);
    return null;

  }
}