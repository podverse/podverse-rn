//@flow
import * as UserTypes from "./types"
import { login } from "../../services/auth"

export const setUserInfo = (userInfo: {}) => {
  return {
    type: UserTypes.SET_USER,
    value: userInfo
  }
}

export const clearUserInfo = () => {
  return {
    type: UserTypes.CLEAR_USER,
    value: {}
  }
}

export const setLoginStatus = (isLoggedIn: boolean) => {
  return {
    type: UserTypes.SET_LOGIN_STATUS,
    value: isLoggedIn
  }
}

export const loginUser = (credentials: {}) => {
  return async (dispatch) => {
    console.log(credentials)
    try {
      const response = await login(credentials.email, credentials.password)
      const user = await response.json()
      dispatch(setUserInfo(user))
      return user
    } catch (e) {
      console.log(e)
    }
  }
}