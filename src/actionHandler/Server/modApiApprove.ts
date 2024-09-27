import Database from 'better-sqlite3';
import { IAPIClientInfo } from '../../type/Server';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * 指定のAPIクライアントの利用を許可する
 * @param _apiClientId API情報の管理用Id
 * @param _newStatus 新しく更新する利用許可状況
 */
export default function modApiApprove(
  _apiClientId: string,
  _newStatus: IAPIClientInfo["approvedStatus"]
): boolean {
  try {

    //APIクライアント情報の許可状況を更新
    db.prepare(
      `UPDATE API_CLIENTS SET approvedStatus=? WHERE apiClientId=?`
    ).run(_newStatus, _apiClientId);

    return true;

  } catch(e) {

    console.log("modApiApprove :: エラー->", e);
    return false;

  }
}