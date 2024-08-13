import type { Socket, Server } from "socket.io";
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
import saveUserChannelOrder from "../actionHandler/User/saveUserChannelOrder";
import fetchUserInbox from "../actionHandler/User/fetchUserInbox";
import removeFromUserInbox from "../actionHandler/User/removeFromUserInbox";

import type IRequestSender from "../type/requestSender";
import type { IUserConfig } from "../type/User";
import type { IChannelOrder } from "../type/Channel";

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
        const configData = fetchUserConfig(RequestSender.userId);

        console.log("User :: socket(fetchUserConfig) : configData->", configData);

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
        const resultChannelOrder = fetchUserChannelOrder(dat.RequestSender.userId);

        //返す
        socket.emit("RESULT::fetchUserChannelOrder", { result:"SUCCESS", data:resultChannelOrder });
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchUserChannelOrder", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザーの通知リストを取得
    socket.on("fetchUserInbox", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: IUserInbox
      }
      */

      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchUserInbox", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //通知Inbox取得
        const inbox = await fetchUserInbox(dat.RequestSender.userId);

        //とれたならそのまま渡す
        if (inbox) {
          socket.emit("RESULT::fetchUserInbox", { result:"SUCCESS", data:inbox });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchUserInbox", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ユーザー通知リストから指定のメッセIdかイベントIdを削除
      //キュー
    const queueRemove:{
      userId: string,
      inboxCategory: "mention"|"event",
      channelId: string,
      itemId: string
    }[] = []
      //キューが動作しているかどうか
    let ActingremoteFromUserInbox:boolean = false;
      //Socketハンドラ
    socket.on("removeFromUserInbox", async (
      dat: {
        RequestSender: IRequestSender,
        inboxCategory: "mention"|"event",
        channelId: string,
        inboxItemId: string
      }
    ) => {
      /* セッション認証 */
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::removeFromUserInbox", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      //キューに追加
      queueRemove.push({
        userId: dat.RequestSender.userId,
        inboxCategory: dat.inboxCategory,
        channelId: dat.channelId,
        itemId: dat.inboxItemId
      });
      //console.log("User :: socket(removeFromUserInbox) : ActingremoteFromUserInbox->", ActingremoteFromUserInbox);

      //もしすでに処理始めているなら停止
      if (ActingremoteFromUserInbox) return;

      try {
        //処理をしていると設定
        ActingremoteFromUserInbox = true;
        //ループで通知削除処理
        while (queueRemove.length !== 0) {
          //キューからデータ取得
          const q = queueRemove[0];
          //Inboxから削除、結果受け取り（引数にキューのデータを使う）
          const inboxEditResult = await removeFromUserInbox(
            q.userId,
            q.inboxCategory,
            q.channelId,
            q.itemId
          );

          //console.log("User :: socket(removeFromUserInbox) :: 結果->", inboxEditResult);

          //結果を送信
          if (inboxEditResult) {
            io.to(q.userId).emit("RESULT::removeFromUserInbox", { result:"SUCCESS", data:true });
          } else {
            io.to(q.userId).emit("RESULT::removeFromUserInbox", { result:"SUCCESS_NO_CHANGES", data:false });
          }

          //キューから削除
          queueRemove.splice(0,1);
          //console.log("User :: socket(removeFromUserInbox) : queueRemove->", queueRemove);
        }

        //処理をやめたと設定
        ActingremoteFromUserInbox = false;
      } catch(e) {
        socket.emit("RESULT::removeFromUserInbox", { result:"ERROR_INTERNAL_THING", data:null });
        return;
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

    //ユーザーごとのチャンネル順序を保存
    socket.on("saveUserChannelOrder", async (dat:{RequestSender:IRequestSender, channelOrder:IChannelOrder}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_DB_THING"|"ERROR_SESSION_ERROR",
        data: null
      }
      */

      //セッション確認
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::saveUserChannelOrder", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //書き込み、結果受け取り
        const resultSaveUserChannelOrder:boolean = await saveUserChannelOrder(dat.RequestSender.userId, dat.channelOrder);
        //結果に応じて結果と設定データを返す
        if (resultSaveUserChannelOrder) {
          socket.emit("RESULT::saveUserChannelOrder", { result:"SUCCESS", data:null});
        } else {
          socket.emit("RESULT::saveUserChannelOrder", { result:"ERROR_DB_THING", data:null});
        }
      } catch(e) {
        socket.emit("RESULT::saveUserChannelOrder", { result:"ERROR_DB_THING", data:null });
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
