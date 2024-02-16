//データが正規のものか確認する
function checkDataIntegrality(dat:any, paramRequire:string[], funcName:string):boolean {
  //そもそも送信者情報が無効ならfalse
  if (dat.reqSender.userid === undefined || dat.reqSender.sessionid === undefined) return false;

  try{
      //パラメータが足りているか確認
      for ( let termIndex in paramRequire ) {
          if ( dat[paramRequire[termIndex]] === undefined ) {
              console.log("-------------------------------");
              console.log("ERROR IN ", dat);
              console.log("does not have enough parameter > " + paramRequire[termIndex]);
              console.log("-------------------------------");

          }

      }

  }
  catch(e) {
      console.log("checkDataIntegrality :: " + funcName + " : (userid:" + dat.reqSender.userid + ") error -> " + e);
      return false;

  }

  //セッションIDの確認
  if ( !auth.checkUserSession(dat.reqSender) ) { return false; }

  console.log("checkDataIntegrality :: (userid:" + dat.reqSender.userid + ") 確認できた => " + funcName);

  //確認できたと返す
  return true;

}