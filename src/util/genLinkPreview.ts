import sqlite3 from "sqlite3";
import { IMessage } from "../type/Message";
const db = new sqlite3.Database("./records/MESSAGE.db");

export default async function genLinkPreview(urls:RegExpMatchArray) {
  try {

    //リンクプレビュー用のインポート
    const ogs = require('open-graph-scraper');
    const options = { url: urls[0] };
    //プレビュー処理
    ogs(options)
    .then((data:any) => {
      const { error, html, result, response } = data;
      //console.log('error:', error);  // This returns true or false. True if there was an error. The error itself is inside the result object.
      //console.log('html:', html); // This contains the HTML of page
      console.log('result:', result); // This contains all of the Open Graph results
      //console.log('response:', response); // This contains response from the Fetch API
    });

  } catch(e) {

    console.log("getLinkPreview :: エラー->", e);
    return null;

  }
}
