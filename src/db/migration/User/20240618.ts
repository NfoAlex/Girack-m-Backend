import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

/**
 * USERS_SAVEのmessageReadIdをmessageReadTimeへ名前変更
 */
export default function migration20240618() {
  const stmtUserSaveTable = db.prepare("PRAGMA table_info(USERS_SAVES)");
  const iterator = stmtUserSaveTable.iterate() as Iterable<{cid:number, name:string}>;

  //USERS_SAVEにmessageReadTimeカラムがあるなら停止する
  for (const column of iterator) {
    if (column.name === "messageReadTime") return;
  }

  //新しくテーブルを作成するため古いテーブルの名前を変更(USERS_SAVES -> USERS_SAVES_TEMP)
  db.prepare(
    "ALTER TABLE USERS_SAVES RENAME TO USERS_SAVES_TEMP"
  ).run();

  //新しくUSERS_SAVEを作る
  db.prepare(
    `
    CREATE TABLE USERS_SAVES(
      userId TEXT PRIMARY KEY,
      messageReadTime TEXT DEFAULT '{}',
      channelOrder TEXT DEFAULT '{}',
      inbox TEXT DEFAULT '{ "mention": {}, "event": {} }',
      FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
    )
    `
  ).run();

  //USERS_SAVES_TEMPから今作ったUSERS_SAVESへコピー
  db.prepare(
    `
    INSERT INTO USERS_SAVES(userId, channelOrder, inbox)
      SELECT userId, ChannelOrder, inbox FROM USERS_SAVES_TEMP
    `
  ).run();

  //古いUSERS_SAVESテーブル削除
  db.prepare("DROP TABLE USERS_SAVES_TEMP").run();

  db.close();
}
