import fs from "fs";
import sqlite3 from "sqlite3";
import mergeDeeply from "../../util/mergeDeeply";
const db = new sqlite3.Database("./records/USER.db");

import { IUserConfig, IUserConfigBeforeParsing } from "../../type/User";

export default function fetchUserConfig(userId:string)
:Promise<IUserConfig|null> {
  //ユーザー情報取得
  return new Promise<IUserConfig|null>((resolve) => {
    try {
      
      //デフォルトの設定値取得
      const defaultConfigData:IUserConfig = JSON.parse(fs.readFileSync('./src/db/defaultValues/UserConfig.json', 'utf-8')); //サーバー情報のJSON読み込み

      //ユーザーをIDで検索
      db.all("SELECT * FROM USERS_CONFIG WHERE userId = ?", [userId], (err:Error, datConfig:IUserConfigBeforeParsing[]) => {
        if (err) {
          console.log("fetchUserConfig :: ERROR ->", err);
          resolve(null);
        } else {
          console.log("fetchUserConfig :: 検索結果->", userId, datConfig);
          //DBでは設定の値がstringで保存されているためJSONへ
          datConfig[0].channel = JSON.parse(datConfig[0].channel);
          datConfig[0].notification = JSON.parse(datConfig[0].notification);
          datConfig[0].sidebar = JSON.parse(datConfig[0].sidebar);
          //設定データをデフォルトにマージする形で形成させる
          const datConfigResult = mergeDeeply(defaultConfigData, datConfig[0]);
          resolve(datConfigResult);
        }
      });
    
    } catch(e) {

      console.log("fetchUserConfig :: fetchUserConfig : エラー->", e);
      resolve(null);
      return;

    }
  });
}
