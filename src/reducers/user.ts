const INITIAL_STATE = {
  uid: 0,
  openid: '',
  session_key: '',
  phone: '',
  nickName: '',
  avatarUrl: '',
  isAdmin: true,
  isLogin: false,
}

export default function user (state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'SET':
      return {
        ...state,
        ...action.val
      }
    default:
      return state
  }
}