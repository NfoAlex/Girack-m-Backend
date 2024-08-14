import Database from 'better-sqlite3';
const _db = new Database('./records/MESSAGE.db');
_db.pragma('journal_mode = WAL');
import ogs from 'open-graph-scraper';

import type { IMessage } from "../type/Message";

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

/**
 * URLからプレビューデータを取得してメッセージデータへ格納する
 * @param _urls 
 * @param _channelId 
 * @param _messageId 
 * @returns 
 */
export default async function genLinkPreview(
  _urls:RegExpMatchArray,
  _channelId:string,
  _messageId: string
):Promise<IMessage["linkData"]|null> {
  try {

    //プレビューデータの格納用変数
    const previewResult:IMessage["linkData"] = {
      //"0":{}
    };

    //URLの配列分フェッチ、パース処理
    for (const index in _urls) {

      //もしURLが画像用ならここで処理して終了
      if (_urls[index].match(/(https?:\/\/.*\.(?:png|jpg|gif))/g) !== null) {
        previewResult[index] = {
          contentType: "image",
          mediaType: "image",
          url: _urls[index],
        };
      } else {

        //Twitter用だったら二重処理
        if (_urls[index].includes("fxtwitter")) {
          //プレビューデータ化処理
          const resultForThis = await fetchURLForTwitter(_urls[index]);
          //挿入 :: ToDo
          //previewResult = {
          //  "0": resultForThis
          //};
          previewResult[index] = resultForThis;
        } else {
          //プレビューデータ化処理
          const resultForThis = await fetchURL(_urls[index]);
          //挿入 :: ToDo
          previewResult[index] = resultForThis;
        }

      }
    }

    //プレビューデータの書き込み処理
    _db.prepare(
      `
      UPDATE C${_channelId} SET
        linkData=?
      WHERE messageId=?
      `
    ).run(JSON.stringify(previewResult), _messageId);

    return previewResult;

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
      images: result.ogImage ? [...result.ogImage] : [],
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
        images: result.ogImage ? [...result.ogImage] : [],
        favicon: result.favicon
      };
    });
  });

  //取得できたメタデータを返す
  return resultFetched;
}
