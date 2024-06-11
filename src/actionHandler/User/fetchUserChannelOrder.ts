import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

export default async function fetchUserChannelOrder(userId: string) {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT channelOrder FROM USERS_SAVES
          WHERE userId=?
        `,
        userId,
        (err:Error, channelOrderData:[{channelOrder: string}]) => {
          //console.log("fetchUserChannelOrder :: db : channelOrder->", channelOrderData);
          //文字列をJSONにしてから返す
          resolve(JSON.parse(channelOrderData[0].channelOrder));
          return;
        }
      )
    });

  } catch(e) {

    console.log("fetchUserChannelOrder :: エラー->", e);
    return null;

  }
}