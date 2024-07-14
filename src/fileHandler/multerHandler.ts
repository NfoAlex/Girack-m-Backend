module.exports = (app:any) => {

  // for debug
  app.get("/hello", (req:any, res:any) => {
    try {  
      res.status(200).send("world");
  
    } catch (e) {
      res.status(500).send("/hello :: 内部エラーが発生しました -> ", e);
    }
  });

}
