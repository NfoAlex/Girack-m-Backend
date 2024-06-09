import { Socket, Server } from "socket.io";
import fetchUserConfig from "../actionHandler/User/fetchUserConfig";
import changeUserName from "../actionHandler/User/changeUserName";
import checkSession from "../actionHandler/auth/checkSession";
import fetchUser from "../actionHandler/User/fetchUser";
import searchUser from "../actionHandler/User/searchUser";
import saveUserConfig from "../actionHandler/User/saveUserConfig";
import fetchUserAll from "../actionHandler/User/fetchUserAll";
import banUser from "../actionHandler/User/banUser";
import pardonUser from "../actionHandler/User/pardonUser";
import roleCheck from "../util/roleCheck";
import fetchUserChannelOrder from "../actionHandler/User/fetchUserChannelOrder";

import type IRequestSender from "../type/requestSender";
import type { IUserConfig } from "../type/User";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //ユーザーの設定データを取得
    socket.on("fetchUserConfig", async (RequestSender:IRequestSender) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(await checkSession(RequestSender))) {
        socket.emit("RESULT::fetchUserConfig", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //設定データ読み取り
        const configData = await fetchUserConfig(RequestSender.userId);

        //返す
        socket.emit("RESULT::fetchUserConfig", { result:"SUCCESS", data:configData });
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchUserConfig", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザーごとのチャンネル順序を取得
    socket.on("fetchUserChannelOrder", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: ServerInfoLimited<IServerInfo>
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchUserChannelOrder", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //チャンネル順序の読み取り
        const resultChannelOrder = await fetchUserChannelOrder(dat.RequestSender.userId);

        //返す
        socket.emit("RESULT::fetchUserChannelOrder", { result:"SUCCESS", data:resultChannelOrder });
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchUserChannelOrder", { result:"ERROR_DB_THING", data:null });
      }
    });
    
    //設定データを保存する
    socket.on("saveUserConfig", async (dat:{RequestSender:IRequestSender, config:IUserConfig}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: dat.config<IUserConfig>|null
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::saveUserConfig", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //書き込み
        const saveUserConfigResult:boolean = await saveUserConfig(dat.RequestSender.userId, dat.config);
        //結果に応じて結果と設定データを返す
        if (saveUserConfigResult) {
          socket.emit("RESULT::saveUserConfig", { result:"SUCCESS", data:dat.config});
        } else {
          socket.emit("RESULT::saveUserConfig", { result:"ERROR_DB_THING", data:null});
        }
      } catch(e) {
        socket.emit("RESULT::saveUserConfig", { result:"ERROR_DB_THING", data:null });
      }
    });

    //一人分のユーザー情報取得(ユーザーIDから)
    socket.on("fetchUserInfo", async (dat:{RequestSender:IRequestSender, userId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: {UserInfo:IUserInfoPublic, UserSession:IUserSession}|null
      }
      */
      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchUserInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        const userInfo = await fetchUser(dat.userId, null);
        socket.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
      } catch(e) {
        socket.emit("RESULT::fetchUserInfo", { result:"ERROR_DB_THING", data:null });
      }

    });

    //複数ユーザーの取得
    socket.on("fetchUserAll", async (dat:{RequestSender:IRequestSender, indexPage:number}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: {[key: string]: IUserInfo}|null
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchUserAll", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ユーザーを取得
        const fetchUserAllResult = await fetchUserAll(dat.indexPage);
        //結果に応じてデータを送信
        if (fetchUserAllResult !== null) {
          socket.emit("RESULT::fetchUserAll", {
            result: "SUCCESS",
            data: {
              datUser: fetchUserAllResult.datUser,
              countUser: fetchUserAllResult.countUser
            } 
          });
        } else {
          socket.emit("RESULT::fetchUserAll", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        socket.emit("RESULT::fetchUserAll", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザー名で検索して一括取得
    socket.on("searchUserInfo", async (
      dat: {
        RequestSender: IRequestSender,
        userName: string, //検索文字列
        rule: "FULL"|"PARTIAL" //全文検索か部分検索か
        channelId?: string //チャンネル限定か、それならチャンネルId
      }
    ) => {
      console.log("User :: searchUserInfo : data->", dat);
      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::searchUserInfo", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //情報検索、取得
        const userInfos = await searchUser(
          dat.userName, dat.rule, dat.channelId
        );

        socket.emit("RESULT::searchUserInfo", { result:"SUCCESS", data:userInfos })
      } catch(e) {
        socket.emit("RESULT::searchUserInfo", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザー名の変更
    socket.on("changeUserName", async (dat:{RequestSender:IRequestSender, userName:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: null
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::changeUserName", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ユーザー名を変更
        await changeUserName(dat.RequestSender.userId, dat.userName);
        socket.emit("RESULT::changeUserName", { result:"SUCCESS", data:null });
        //現在のユーザー情報を取得して送信
        const userInfo = await fetchUser(dat.RequestSender.userId, null);
        io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
      } catch(e) {
        socket.emit("RESULT::changeUserName", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザーをBANする
    socket.on("banUser", async (dat:{RequestSender:IRequestSender, targetUserId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR"|"ERROR_ROLE",
        data: <boolean>
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::banUser", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //もし操作者と標的が一緒なら停止
        if (dat.RequestSender.userId === dat.targetUserId) {
          socket.emit("RESULT::banUser", { result:"ERROR_DB_THING", data:false });
          return;
        }

        //ユーザー情報が空、あるいはホスト権限を持つユーザーなら停止
        const userInfo = await fetchUser(dat.targetUserId, null);
        if (userInfo === null || userInfo.userId === "HOST") {
          socket.emit("RESULT::banUser", { result:"ERROR_DB_THING", data:false });
          return;
        }

        //権限確認
        if (!(await roleCheck(dat.RequestSender.userId, "UserManage"))) {
          socket.emit("RESULT::banUser", { result:"ERROR_ROLE", data:false });
          return;
        }

        //BAN処理
        const banUserResult = await banUser(dat.RequestSender.userId, dat.targetUserId);
        //結果を返す
        if (banUserResult) {
          socket.emit("RESULT::banUser", { result:"SUCCESS", data:true });

          //現在のユーザー情報を取得して送信
          const userInfo = await fetchUser(dat.targetUserId, null);
          io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
        } else {
          socket.emit("RESULT::banUser", { result:"ERROR_DB_THING", data:false });
        }
      } catch(e) {
        console.log("User :: banUser : エラー->", e);
        socket.emit("RESULT::banUser", { result:"ERROR_DB_THING", data:false });
      }
    });

    //ユーザーのBAN状態を解除する
    socket.on("pardonUser", async (dat:{RequestSender:IRequestSender, targetUserId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR"|"ERROR_ROLE",
        data: <boolean>
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::pardonUser", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ユーザー情報が空なら停止
        const userInfo = await fetchUser(dat.targetUserId, null);
        if (userInfo === null) {
          socket.emit("RESULT::pardonUser", { result:"ERROR_DB_THING", data:false });
          return;
        }

        //権限確認
        if (!(await roleCheck(dat.RequestSender.userId, "UserManage"))) {
          socket.emit("RESULT::pardonUser", { result:"ERROR_ROLE", data:false });
          return;
        }

        //BANの解除処理
        const pardonUserResult = await pardonUser(dat.RequestSender.userId, dat.targetUserId);
        //結果を返す
        if (pardonUserResult) {
          socket.emit("RESULT::pardonUser", { result:"SUCCESS", data:true });

          //現在のユーザー情報を取得して送信
          const userInfo = await fetchUser(dat.targetUserId, null);
          io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
        } else {
          socket.emit("RESULT::pardonUser", { result:"ERROR_DB_THING", data:false });
        }
      } catch(e) {
        console.log("User :: pardonUser : エラー->", e);
        socket.emit("RESULT::pardonUser", { result:"ERROR_DB_THING", data:false });
      }
    });

  });
}
