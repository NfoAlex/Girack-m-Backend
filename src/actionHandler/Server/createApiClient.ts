import type { IAPIClientInfo, IAPIClientInfoBeforeParsing } from "../../type/Server";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

/**
 * API利用情報を作成する
 */
export default function createApiClient(
  _userId: string,
  _name: string,
  _description: string
): boolean {
  try {

    //API利用情報を挿入
    db.prepare(
      `
      INSERT INTO API_CLIENTS (
        apiClientId,
        apiKey,
        clientName,
        description,
        createdUserId,
        isEnabled,
        approvedStatus
      ) values (?,?,?,?,?,?,?)
      `
    ).run(
      generateRandomKey(12),
      `api_${generateRandomKey(24)}`,
      _name,
      _description,
      _userId,
      0,
      "WAITING"
    );
    
    return true;

  } catch(e) {

    console.log("fetchApiInfo :: エラー->", e);
    return false;

  }
}

//ランダムの英数字生成
function generateRandomKey(_length:number):string {
  const LENGTH = _length; //生成したい文字列の長さ
  const SOURCE = "abcdefghijklmnopqrstuvwxyz0123456789"; //元になる文字

  //文字列格納用変数
  let result = "";

  for(let i=0; i<LENGTH; i++){
    result += SOURCE[Math.floor(Math.random() * SOURCE.length)];
  }

  return result;
}
