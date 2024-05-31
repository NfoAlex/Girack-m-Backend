import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/SERVER.db");
import roleCheck from "../../util/roleCheck";

import type { IChannel } from "../../type/Channel";

export default async function updateChannel(userId:string, channelId:string, channelInfo:IChannel)
:Promise<boolean> {
  try {

    //チャンネル編集権限があるか調べて、なければfalse
    const resultRoleCheck = await roleCheck(userId, "ChannelManage");
    if (!resultRoleCheck) return false;

    return new Promise((resolve) => {
      //更新
      db.run(
        `
        UPDATE CHANNELS SET
          channelName=?,
          description=?,
          isPrivate=?,
          speakableRole=?
        WHERE channelId=?
        `,
        [
          channelInfo.channelName,
          channelInfo.description,
          channelInfo.isPrivate,
          channelInfo.speakableRole,
          channelId
        ], (err:Error) => {
          if (err) {
            console.log("updateChannel :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("updateChannel :: エラー->", e);
    return false;

  }
}
