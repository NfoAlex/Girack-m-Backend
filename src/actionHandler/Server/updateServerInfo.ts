import fs from "fs";
import { ServerInfo } from "../../db/InitServer";
import mergeDeeply from "../../util/mergeDeeply";

import type IServerInfo from "../../type/Server";

//サーバー設定テンプレ
const ServerInfoTemplate:IServerInfo = JSON.parse(fs.readFileSync('./src/db/defaultValues/ServerInfo.json', 'utf-8'));

export default function updateServerInfo(
  servernameNew:string,
  registrationNew:IServerInfo["registration"]
):boolean {
  try {

    //データ更新
    ServerInfo.servername = servernameNew;
    ServerInfo.registration = mergeDeeply(ServerInfoTemplate.registration, registrationNew);

    //JSONファイルへ書き込み
    fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

    return true;

  } catch(e) {

    return false;

  }
}
