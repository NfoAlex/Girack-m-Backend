import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

/**
 * USERS_SAVEのmessageReadIdをmessageReadTimeへ名前変更
 */
export default async function migration20240618() {
  db.serialize(() => {
    //messageReadTimeカラムがあるか調べてこの処理を続けるか判別して止める
    db.all(
      `
      PRAGMA table_info(USERS_SAVES)
      `,
      (err:Error, tableInfo:{cid:number, name:string}[]) => {
        if (err) {
          console.log("err->", err);
        } else {
          //console.log("migration(20240618) :: tableInfo->", tableInfo);
          for (let column of tableInfo) {
            //もしmessageReadTimeがカラムがすでにあるなら処理をここで止める
            if (column.name === "messageReadTime") {
              return;
            }
          }
        }
      }
    );

    //新しくテーブルを作成するため古いテーブルの名前を変更(USERS_SAVES -> USERS_SAVES_TEMP)
    db.all(
      `
      ALTER TABLE USERS_SAVES RENAME TO USERS_SAVES_TEMP
      `,
      (err:Error, tables:[{name:string}]) => {
        if (err) {
          console.log("migration(20240618) :: エラー!->", err);
        }
        return;
      }
    );

    //新しくUSERS_SAVEを作る
    db.run(`CREATE TABLE USERS_SAVES(
      userId TEXT PRIMARY KEY,
      messageReadTime TEXT DEFAULT '{}',
      channelOrder TEXT DEFAULT '{}',
      inbox TEXT DEFAULT '{ "mention": {}, "event": {} }',
      FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
    )`);

    //USERS_SAVES_TEMPから今作ったUSERS_SAVESへコピー
    db.run(
      `
      INSERT INTO USERS_SAVES(userId, channelOrder, inbox)
        SELECT userId, ChannelOrder, inbox FROM USERS_SAVES_TEMP
      `
    )

    //古いUSERS_SAVESテーブル削除
    db.all(
      `
      DROP TABLE USERS_SAVES_TEMP
      `,
      (err:Error, tables:[{name:string}]) => {
        if (err) {
          console.log("migration(20240618) :: エラー!->", err);
        }
        return;
      }
    );

    db.close();
  });
}
