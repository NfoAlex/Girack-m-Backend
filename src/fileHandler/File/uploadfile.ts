/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default async function uploadfile(req:any, res:any) {
  try {

    // 補足データ（metadata）を取得し、JSONとしてパース
    console.log("/uploadfile :: これからの処理に使うreq.body.metadata->", req.body.metadata);

    console.log("/uploadfile :: ファイルが書き込まれました");

    res.status(200).send("SUCCESS");

  } catch (e) {

    console.log("/uploadfile :: エラー!->", e);
    res.status(500).send("ERROR_INTERNAL_THING");
  
  }
}