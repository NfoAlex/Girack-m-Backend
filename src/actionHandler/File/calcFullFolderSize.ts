import calcDirectorySize from "../../util/FIle/calcDirectorySize";

/**
 * フォルダのサイズを取得
 */
export default async function calcFullFolderSize(
  userId: string,
):Promise<number|null> {
  try {

    //容量を計算する、できなかったらエラー
    const folderSize = await calcDirectorySize(userId, "");
    if (folderSize === null) {
      return null;
    }

    //結果
    return folderSize;

  } catch(e) {

    console.log("calcFullFolderSize :: エラー->", e);
    return null;

  }
}