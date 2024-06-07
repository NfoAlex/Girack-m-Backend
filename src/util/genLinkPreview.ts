import sqlite3 from "sqlite3";
import { IMessage } from "../type/Message";
const db = new sqlite3.Database("./records/MESSAGE.db");

//取得できるOpenGraphデータのinterface
interface IOGData {
  ogSiteName: string,
  ogTitle: string,
  ogType: string,
  ogUrl: string,
  ogImage: {url:string, type:string}[],
  ogDescription: string,
  favicon: string,
  requestUrl: string,
  success: boolean
};

//取得したメタデータをパースしたもの
interface IURLParsed {
  contentType: "text/html",
  mediaType: string,
  url: string,
  siteName: string,
  title: string,
  description: string,
  images: {url:string, type:string}[],
  favicon: string
};

import ogs from 'open-graph-scraper';

export default async function genLinkPreview(
  urls:RegExpMatchArray,
  channelId:string,
  messageId: string
):Promise<IMessage["linkData"]|null> {
  try {

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

      //Twitter用だったら二重処理
      if (urls[0].includes("fxtwitter")) {
        //プレビューデータ化処理
        const resultForThis = await fetchURLForTwitter(urls[0]);
        //挿入 :: ToDo
        previewResult = {
          "0": resultForThis
        };
      } else {
        //プレビューデータ化処理
        const resultForThis = await fetchURL(urls[0]);
        //挿入 :: ToDo
        previewResult = {
          "0": resultForThis
        };
      }

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

/**
 * URLのパース処理
 * @param url
 */
async function fetchURL(url:string):Promise<IURLParsed> {
  //結果格納用
  let resultFetched:IURLParsed = {
    contentType: "text/html",
    mediaType: "",
    url: "",
    siteName: "",
    title: "",
    description: "",
    images: [],
    favicon: ""
  };

  //フェッチ、メタデータパース
  await ogs({url: url})
  .then((data:any) => {
    const { error, html, result, response } = data;

    //パース
    resultFetched = {
      contentType: "text/html",
      mediaType: result.ogType,
      url: result.ogUrl,
      siteName: result.ogSiteName,
      title: result.ogTitle,
      description: result.ogDescription,
      images: result.ogImage,
      favicon: result.favicon
    };
  });

  //取得できたメタデータを返す
  return resultFetched;
}

/**
 * twitter用のURLパース処理
 * @param url 
 */
async function fetchURLForTwitter(url:string) {
  //結果格納用
  let resultFetched:IURLParsed = {
    contentType: "text/html",
    mediaType: "",
    url: "",
    siteName: "",
    title: "",
    description: "",
    images: [],
    favicon: ""
  };

  //一度純粋にHTMLをフェッチ
  await fetch(url).then(async (res) => {
    //取得データをテキスト化
    return await res.text();
  }).then(async (text) => {
    //console.log("simple fetched json->", text);
    //処理したHTMLのテキストからmetaデータ取得する
    await ogs({ html: text }).then((data:any) => {
      const { error, html, result, response } = data;
      //console.log("genLink Preview :: parsed for Better timing->", result);
      //パース
      resultFetched = {
        contentType: "text/html",
        mediaType: result.ogType,
        url: result.ogUrl,
        siteName: result.ogSiteName,
        title: result.ogTitle,
        description: result.ogDescription,
        images: result.ogImage,
        favicon: result.favicon
      };
    });
  });

  //取得できたメタデータを返す
  return resultFetched;
}