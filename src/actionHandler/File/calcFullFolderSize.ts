import calcDirectorySize from "../../util/FIle/calcDirectorySize";

/**
 * 指定のユーザーId用フォルダの総サイズを取得
 * @param _userId 
 * @returns 
 */
export default function calcFullFolderSize(
  _userId: string,
):number|null {
  try {

    //容量を計算する、できなかったらエラー
    const folderSize = calcDirectorySize(_userId, "");
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