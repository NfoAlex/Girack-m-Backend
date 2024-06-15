import sqlite3 from "sqlite3";
import fetchUserInbox from "./fetchUserInbox";
const db = new sqlite3.Database("./records/USER.db");

export default async function removeFromUserInbox(
  userId: string,
  inboxCategory: "mention"|"event",
  channelId: string,
  itemId: string
):Promise<boolean> {
  try {

    //このユーザーのInbox取得
    const inboxEditing = await fetchUserInbox(userId);
    if (!inboxEditing) {
      return false;
    };

    //指定の項目Idの場所取得
    const indexOfItemId = inboxEditing[inboxCategory][channelId].indexOf(itemId);
      //消したい項目Idが無ければエラーとして返す
    if (indexOfItemId === -1) {
      return false;
    }

    //指定のIdの項目を削除
    inboxEditing[inboxCategory][channelId].splice(indexOfItemId, 1);

    return new Promise((resolve) => {
      db.run(
        `
        UPDATE USERS_SAVES SET inbox=?
          WHERE userId=?
        `,
        [JSON.stringify(inboxEditing), userId],
        (err:Error, inboxData:[{inbox: string}]) => {
          if (err) {
            console.log("removeFromUserInbox :: エラー->", err);
            resolve(false);
            return;
          } else {
            //console.log("removeFromUserInbox :: db : channelOrder->", channelOrderData);
            resolve(true);
            return;
          }
        }
      )
    });

  } catch(e) {

    console.log("removeFromUserInbox :: エラー->", e);
    return false;

  }
}
