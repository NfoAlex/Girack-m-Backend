import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

/**
 * フォルダーを作成する
 * @param userId 
 * @param folderName 
 * @param directory 
 */
export default function createFolder(
  _userId: string,
  _folderName: string,
  _directoryId = ""
):boolean {
  try {

    //ファイルId生成
    const folderIdGenerated = () => {
      let id = "";
      for (let i=0; i<10; i++) {
        id += Math.floor(Math.random()*9).toString();
      }
      return id;
    }

    //フォルダデータをテーブルへ挿入
    db.prepare(
      `
      INSERT INTO FOLDERS (
        id, userId, name, positionedDirectoryId
      ) VALUES (?, ?, ?, ?)
      `
    ).run(folderIdGenerated(), _userId, _folderName, _directoryId);

    return true;

  } catch(e) {

    console.log("createFolder :: エラー->", e);
    return false;

  }
}