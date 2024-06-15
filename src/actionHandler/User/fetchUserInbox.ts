import sqlite3 from "sqlite3";
import { IUserInbox } from "../../type/User";
const db = new sqlite3.Database("./records/USER.db");

export default async function fetchUserInbox(userId: string):Promise<IUserInbox|null> {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT inbox FROM USERS_SAVES
          WHERE userId=?
        `,
        userId,
        (err:Error, inboxData:[{inbox: string}]) => {
          if (err) {
            console.log("fetchUserInbox :: エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchUserChannelOrder :: db : channelOrder->", channelOrderData);
            //文字列をJSONにしてから返す
            resolve(JSON.parse(inboxData[0].inbox));
            return;
          }
        }
      )
    });

  } catch(e) {

    console.log("fetchInbox :: エラー->", e);
    return null;

  }
}