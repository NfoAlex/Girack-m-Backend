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

export default async function calcRoleData(roleDataChecking:IUserRole)
:Promise<number> {
  try {

    //権限をそれぞれ調べてレベルを返す
    if (roleDataChecking.ServerManage) {
      return 5;
    } else if (roleDataChecking.RoleManage) {
      return 4;
    } else if (
      roleDataChecking.ChannelManage
      ||
      roleDataChecking.UserManage
    ) {
      return 3;
    } else if (
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
