import fs from "fs";
import { ServerInfo } from "../../db/InitServer";
import mergeDeeply from "../../util/mergeDeeply";

import IServerInfo from "../../type/Server";

//サーバー設定テンプレ
const ServerInfoTemplate:IServerInfo = JSON.parse(fs.readFileSync('./src/db/defaultValues/ServerInfo.json', 'utf-8'));

export default function updateServerConfig(
  ServerConfigUpdating: IServerInfo["config"]
):boolean {
  try {

    //サーバー設定を更新
    ServerInfo.config = mergeDeeply(ServerInfoTemplate.config, ServerConfigUpdating);
    //JSONファイルへ書き込み
    fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

    return true;

  } catch(e) {

    return false;

  }
}
