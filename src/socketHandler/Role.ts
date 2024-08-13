import type { Socket, Server } from "socket.io";

import fetchRoles from "../actionHandler/Role/fetchRoles";
import checkSession from "../actionHandler/auth/checkSession";
import roleCheck from "../util/roleCheck";
import createRole from "../actionHandler/Role/createRole";
import updateRole from "../actionHandler/Role/updateRole";
import deleteRole from "../actionHandler/Role/deleteRole";
import addRole from "../actionHandler/Role/addRole";
import unlinkRole from "../actionHandler/Role/unlinkRole";
import fetchUser from "../actionHandler/User/fetchUser";
import fetchRoleSingle from "../actionHandler/Role/fetchRoleSingle";
import searchRole from "../actionHandler/Role/searchRole";

import type IRequestSender from "../type/requestSender";
import type { IUserRole } from "../type/User";

module.exports = (io:Server) => {
  io.on("connection", (socket:Socket) => {

    //ロール情報をすべて取得
    socket.on("fetchRoles", async (dat:{RequestSender:IRequestSender}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING",
        data: IUserRole[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchRoles", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //全ロールを取得
        const roles = fetchRoles();

        //nullじゃないならそれを返す
        if (roles !== null) {
          socket.emit("RESULT::fetchRoles", { result:"SUCCESS", data:roles });
        } else {
          socket.emit("RESULT::fetchRoles", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::fetchRoles", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ロールを検索
    socket.on("searchRole", async (
      dat: {
        RequestSender: IRequestSender,
        searchQuery: string,
        pageIndex: number
      }
    ) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::searchRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロールを検索
        const roleResult = searchRole(dat.searchQuery, dat.pageIndex);
        //nullじゃないなら結果送信
        if (roleResult !== null) {
          socket.emit("RESULT::searchRole", { result:"SUCCESS", data:roleResult });
        } else {
          socket.emit("RESULT::searchRole", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        console.log("Role :: socket(searchRole) : エラー->", e);
        socket.emit("RESULT::searchRole", { result:"ERROR_INTERNAL_THING", data:null });
      }
    });

    //単一ロールを取得
    socket.on("fetchRoleSingle", async (dat:{RequestSender:IRequestSender, roleId:string}) => {
      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::fetchRoleSingle", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロール取得
        const roleInfo:IUserRole = await fetchRoleSingle(dat.roleId);

        //ロール情報を送信
        socket.emit("RESULT::fetchRoleSingle", { result:"SUCCESS", data:roleInfo });
      } catch(e) {
        console.log("Role :: fetchRoleSingle : エラー->", e);
        socket.emit("RESULT::fetchRoleSingle", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ロールをユーザーへ付与
    socket.on("addRole", async (
      dat:{
        RequestSender: IRequestSender,
        targetUserId: string,
        roleId: string
      }
    ) => {
        /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_ROLE",
        data: <boolean>
      }
      */
     //セッション認証
     if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::addRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロール権限の確認
        if (!(roleCheck(dat.RequestSender.userId, "RoleManage"))) {
          socket.emit("RESULT::addRole", { result:"ERROR_ROLE", data:false });
          return;
        }

        //ロールを付与
        const addRoleResult:boolean = addRole(dat.RequestSender.userId, dat.targetUserId, dat.roleId);
        //結果に応じてそう返す
        if (addRoleResult) {
          socket.emit("RESULT::addRole", { result:"SUCCESS", data:addRoleResult });

          //成功したのならそのユーザーの情報を全体に送信
          const userInfo = fetchUser(dat.targetUserId, null);
          io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
        } else {
          socket.emit("RESULT::addRole", { result:"ERROR_DB_THING", data:addRoleResult });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::addRole", { result:"ERROR_DB_THING", data:false });
      }
    });

    //ロールをユーザーから削除する
    socket.on("unlinkRole", async (
      dat:{
        RequestSender: IRequestSender,
        targetUserId: string,
        roleId: string
      }
    ) => {
        /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_ROLE",
        data: <boolean>
      }
      */
     //セッション認証
     if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::unlinkRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロール権限の確認
        if (!(roleCheck(dat.RequestSender.userId, "RoleManage"))) {
          socket.emit("RESULT::unlinkRole", { result:"ERROR_ROLE", data:null });
          return;
        }

        //ロールを付与
        const unlinkRoleResult:boolean = unlinkRole(dat.RequestSender.userId, dat.targetUserId, dat.roleId);
        //結果に応じてそう返す
        if (unlinkRoleResult) {
          socket.emit("RESULT::unlinkRole", { result:"SUCCESS", data:unlinkRoleResult });

          //成功したのならそのユーザーの情報を全体に送信
          const userInfo = fetchUser(dat.targetUserId, null);
          io.emit("RESULT::fetchUserInfo", { result:"SUCCESS", data:userInfo });
        } else {
          socket.emit("RESULT::unlinkRole", { result:"ERROR_DB_THING", data:unlinkRoleResult });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::unlinkRole", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ロールを作成
    socket.on("createRole", async (
      dat:{
        RequestSender:IRequestSender,
        roleData: {
          name: string,
          color: string
        }
    }) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_ROLE",
        data: IUserRole[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::createRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //ロール権限の確認
        if (!(await roleCheck(dat.RequestSender.userId, "RoleManage"))) {
          socket.emit("RESULT::createRole", { result:"ERROR_ROLE", data:null });
          return;
        }

        //ロールを作成
        const createRoleResult:string|null = await createRole(dat.RequestSender.userId, dat.roleData);
        //結果に応じてそう返す
        if (createRoleResult !== null) {
          socket.emit("RESULT::createRole", { result:"SUCCESS", data:null });

          //作成したロール情報を送信
          const roleInfo:IUserRole = await fetchRoleSingle(createRoleResult);
          io.emit("RESULT::fetchRoleSingle", { result:"SUCCESS", data:roleInfo });
        } else {
          socket.emit("RESULT::createRole", { result:"ERROR_DB_THING", data:null });
        }
      } catch(e) {
        //返す
        socket.emit("RESULT::createRole", { result:"ERROR_DB_THING", data:null });
      }
    });

    //ロールを更新
    socket.on("updateRole", async (dat:{RequestSender:IRequestSender, roleData:IUserRole}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_ROLE"|"ERROR_CANNOT_EDIT_THIS",
        data: IUserRole[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::updateRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //HOSTかMEMBERロールを更新しようとしているなら停止
        if (dat.roleData.roleId === "MEMBER" || dat.roleData.roleId === "HOST") {
          socket.emit("RESULT::updateRole", { result:"ERROR_CANNOT_EDIT_THIS", data:null });
          return;
        }

        //ロール権限の確認
        if (!(await roleCheck(dat.RequestSender.userId, "RoleManage"))) {
          socket.emit("RESULT::updateRole", { result:"ERROR_ROLE", data:null });
          return;
        }

        //ロールの更新、結果を格納
        const updateRoleResult = await updateRole(dat.RequestSender.userId, dat.roleData);
        //結果に応じて送信
        if (updateRoleResult) {
          socket.emit("RESULT::updateRole", {result:"SUCCESS", data:null});

          //現在のロール情報を全員に送信
          const roleInfo = await fetchRoleSingle(dat.roleData.roleId);
          io.emit("RESULT::fetchRoleSingle", { result:"SUCCESS", data:roleInfo });
        } else {
          socket.emit("RESULT::updateRole", {result:"ERROR_DB_THING", data:null});
        }

      } catch(e) {
        socket.emit("RESULT::updateRole", {result:"ERROR_DB_THING", data:null});
      }
    });

    //ロールを更新
    socket.on("deleteRole", async (dat:{RequestSender:IRequestSender, roleId:string}) => {
      /*
      返し : {
        result: "SUCCESS"|"ERROR_SESSION_ERROR"|"ERROR_DB_THING"|"ERROR_ROLE"|"ERROR_CANNOT_DELETE_THIS",
        data: IUserRole[]|null
      }
      */

      //セッション認証
      if (!(await checkSession(dat.RequestSender))) {
        socket.emit("RESULT::deleteRole", { result:"ERROR_SESSION_ERROR", data:null });
        return;
      }

      try {
        //HOSTかMEMBERロールを削除しようとしているなら停止
        if (dat.roleId === "MEMBER" || dat.roleId === "HOST") {
          socket.emit("RESULT::deleteRole", { result:"ERROR_CANNOT_DELETE_THIS", data:null });
          return;
        }

        //ロール権限の確認
        if (!(await roleCheck(dat.RequestSender.userId, "RoleManage"))) {
          socket.emit("RESULT::deleteRole", { result:"ERROR_ROLE", data:null });
          return;
        }

        //ロールの更新、結果を格納
        const deleteRoleResult = await deleteRole(dat.roleId);
        //結果に応じて送信
        if (deleteRoleResult) {
          socket.emit("RESULT::deleteRole", {result:"SUCCESS", data:null});
        } else {
          socket.emit("RESULT::deleteRole", {result:"ERROR_DB_THING", data:null});
        }

      } catch(e) {
        socket.emit("RESULT::deleteRole", {result:"ERROR_DB_THING", data:null});
      }
    });

  });
}
