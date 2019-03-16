import * as AuthTypes from '../actions/types'

const initialState = {
  userInfo: {},
  isLoggedIn: false
}

const authReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case AuthTypes.SET_USER:
      return {
        ...state,
        userInfo: { ...action.value }
      }
    case AuthTypes.CLEAR_USER:
      return {
        ...state,
        userInfo: {}
      }
    case AuthTypes.SET_LOGIN_STATUS:
      return {
        ...state,
        isLoggedIn: action.value
      }
    default:
      break
  }

  return state
}

export default authReducer
