import sqlite3 from "sqlite3";
import { IMessage } from "../type/Message";
const db = new sqlite3.Database("./records/MESSAGE.db");

//取得できるOpenGraphデータのinterface
interface IOGData {
  ogSiteName: string,
  ogTitle: string,
  ogType: string,
  ogUrl: string,
  ogImage: [{url:string, type:string}],
  ogDescription: string,
  favicon: string,
  requestUrl: string,
  success: boolean
};

export default async function genLinkPreview(
  urls:RegExpMatchArray,
  channelId:string,
  messageId: string
):Promise<IMessage["linkData"]|null> {
  try {

    //リンクプレビュー用のインポート
    const ogs = require('open-graph-scraper');
    const options = { url: urls[0] };

    //プレビューデータの格納用変数
    let previewResult:IMessage["linkData"] = {
      "0":{}
    };

    console.log("genLinkPreview :: match as image?->", urls[0].match(/(https?:\/\/.*\.(?:png|jpg))/g));

    //もしURLが画像用ならここで処理して終了
    if (urls[0].match(/(https?:\/\/.*\.(?:png|jpg))/g) !== null) {
      previewResult = {
        "0": {
          mediaType: "image",
          url: urls[0],
        }
      };
    } else {

      //プレビューデータ化処理
      await ogs(options)
      .then((data:any) => {
        const { error, html, result, response } = data;
        //console.log('error:', error);  // This returns true or false. True if there was an error. The error itself is inside the result object.
        //console.log('html:', html); // This contains the HTML of page
        console.log('result:', result); // This contains all of the Open Graph results
        //パース
        previewResult = {
          "0": {
            contentType: "text/html",
            mediaType: result.ogType,
            url: result.ogUrl,
            siteName: result.ogSiteName,
            title: result.ogTitle,
            description: result.ogDescription,
            images: result.ogImage,
            favicon: result.favicon
          }
        };
        console.log('response:', response); // This contains response from the Fetch API
      });

    }

    //プレビューデータの書き込み処理
    return new Promise((resolve)=> {
      db.run(
        `
        UPDATE C` + channelId + ` SET
          linkData=?
        WHERE messageId=?
        `,
        [JSON.stringify(previewResult), messageId],
        (err:Error) => {
          if (err) {
            console.log("genLinkPreview :: エラー->", err);
            resolve(null);
            return;
          } else {
            resolve(previewResult);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("getLinkPreview :: エラー->", e);
    return null;

  }
}
