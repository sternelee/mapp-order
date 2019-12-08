const INITIAL_STATE = {
  isIphonex: false,
  openTime: 9,
  closeTime: 22,
}

export default function page (state = INITIAL_STATE, action) {
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