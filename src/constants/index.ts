export interface User {
  uid: number,
  openid: string,
  session_key: string,
  phone: string,
  nickName: string,
  avatarUrl: string,
  isAdmin: boolean,
  isLogin: boolean,
}