//@flow
import * as UserTypes from "./types"
import { login, signUp, getAuthenticatedUserInfo } from "../../services/auth"

type Credentials = {
  email: string,
  password: string,
  name: string
}

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

export const loginUser = (credentials: Credentials) => {
  return async (dispatch) => {
    const response = await login(credentials.email, credentials.password)
    if(response.status !== 200) {
      throw new Error(response._bodyInit)
    }

    const user = await response.json()
    dispatch(setUserInfo(user))
    return user
  }
}

export const signUpUser = (credentials: Credentials) => {
  return async (dispatch) => {
    await signUp(credentials.email, credentials.password, credentials.name)
    return dispatch(getAuthUserInfo())
  }
}

export const getAuthUserInfo = () => {
  return async (dispatch) => {
    const response = await getAuthenticatedUserInfo()
    console.log("Get Auth response is: ", response)
    if(response.status !== 200) {
      throw new Error(response._bodyInit)
    }
    debugger
    const user = await response.json()
    dispatch(setUserInfo(user))
    return user
  }
}