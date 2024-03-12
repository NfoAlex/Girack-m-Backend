import fs from "fs";
import { ServerInfo } from "../../db/InitServer";

import type IServerInfo from "../../type/Server";

export default function updateServerInfo(
  servernameNew:string,
  registrationNew:IServerInfo["registration"]
):boolean {
  try {

    //データ更新
    ServerInfo.servername = servernameNew;
    ServerInfo.registration = registrationNew;

    //JSONファイルへ書き込み
    fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

    return true;

  } catch(e) {

    return false;

  }
}
