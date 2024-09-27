import type { IAPIClientInfo, IAPIClientInfoBeforeParsing } from "../../type/Server";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * 管理者としてすべてのAPI利用情報を取得する
 */
export default function fetchAllApiInfo(_userId: string, _indexPage = 1):IAPIClientInfo[]|null {
  try {

    //表示ページ番号が0未満ならnull
    if (_indexPage < 0) return null;

    //表示ページ番号に合わせてoffsetを設定
    const offset = (_indexPage - 1) * 30;

    //ここで取得
    const apiClientInfo = db.prepare(
      "SELECT * FROM API_CLIENTS LIMIT 30 OFFSET ?"
    ).all(offset) as IAPIClientInfoBeforeParsing[] | undefined;
    
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