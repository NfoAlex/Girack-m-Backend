import fs from "fs";
import { ServerInfo } from "../../db/InitServer";

import IServerInfo from "../../type/Server";

export default function updateServerConfig(
  ServerConfigUpdating:IServerInfo["config"]
):boolean {
  try {

    // ToDo :: ロール確認

    //サーバー設定を更新
    ServerInfo.config = ServerConfigUpdating;
    //JSONファイルへ書き込み
    fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

    return true;

  } catch(e) {

    return false;

  }
}
