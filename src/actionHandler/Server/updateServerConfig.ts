import fs from "fs";
import { ServerInfo } from "../../db/InitServer";
import roleCheck from "../../util/roleCheck";

import IServerInfo from "../../type/Server";

export default async function updateServerConfig(
  userId: string,
  ServerConfigUpdating: IServerInfo["config"]
):Promise<boolean> {
  try {

    //ロール確認
    const roleCheckResult = await roleCheck(userId, "ServerManage");
    if (!roleCheckResult) return false;

    //サーバー設定を更新
    ServerInfo.config = ServerConfigUpdating;
    //JSONファイルへ書き込み
    fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

    return true;

  } catch(e) {

    return false;

  }
}
