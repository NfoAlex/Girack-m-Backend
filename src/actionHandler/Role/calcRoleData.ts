import type { IUserRole } from "../../type/User";

/*
//権限それぞれの持つレベル(数値)
const roleLevel:{
  [key:string]: number
} = {
  ServerManage: 5,
  RoleManage: 4,
  ChannelManage: 3,
  UserManage: 3,
  MessageDelete: 2,
  MessageAttatchFile: 1
};
*/

/**
 * ロールデータのロールレベルを取得
 * @param roleDataChecking 
 * @returns 
 */
export default function calcRoleData(roleDataChecking:IUserRole)
:number {
  try {

    //権限をそれぞれ調べてレベルを返す
    if (roleDataChecking.ServerManage) {
      return 5;
    }
    
    if (roleDataChecking.RoleManage) {
      return 4;
    }
    
    if (
      roleDataChecking.ChannelManage
      ||
      roleDataChecking.UserManage
    ) {
      return 3;
    }
    
    if (
      roleDataChecking.MessageDelete
    ) {
      return 2;
    }

    //2以下はもう1として返す
    return 1;

  } catch(e) {

    console.log("calcRoleData :: エラー ->", e);
    return 0;

  }
}
