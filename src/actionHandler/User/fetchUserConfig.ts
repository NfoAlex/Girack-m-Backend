import fs from "node:fs";
import mergeDeeply from "../../util/mergeDeeply";

import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import type { IUserConfig, IUserConfigBeforeParsing } from "../../type/User";

/**
 * ユーザーの設定データを取得
 * @param userId 
 * @returns 
 */
export default function fetchUserConfig(_userId:string)
:IUserConfig|null {
  try {
    //デフォルトの設定値取得
    const defaultConfigData:IUserConfig = JSON.parse(fs.readFileSync('./src/db/defaultValues/UserConfig.json', 'utf-8')); //サーバー情報のJSON読み込み

    const userConfig = db.prepare("SELECT * FROM USERS_CONFIG WHERE userId = ?").get(_userId) as IUserConfigBeforeParsing | undefined;
    if (userConfig === undefined) return null;

    //パースする
    const userConfigParsed:IUserConfig = {
      ...userConfig,
      channel: JSON.parse(userConfig.channel),
      notification: JSON.parse(userConfig.notification),
      sidebar: JSON.parse(userConfig.sidebar),
      userId: _userId
    };

    const configResult:IUserConfig = mergeDeeply(defaultConfigData, userConfigParsed);
    console.log("fetchUserConfig :: マージ->", configResult);


    //マージした設定JSONを返す
    return configResult;

  } catch(e) {

    return null;

  }
}
