import { getAuthenticatedUserInfo, login, signUp, logout } from 'podverse/src/services/auth'
import * as UserTypes from './types'
import {Alert} from "react-native"
import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from 'podverse/src/resources'

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
  return async (dispatch: any) => {
    const user = await login(credentials.email, credentials.password)
    dispatch(setUserInfo(user))
    dispatch(setLoginStatus(true))
    return user
  }
}

export const signUpUser = (credentials: Credentials) => {
  return async (dispatch: any) => {
    await signUp(credentials.email, credentials.password, credentials.name)
    return dispatch(getAuthUserInfo())
  }
}

export const getAuthUserInfo = () => {
  return async (dispatch: any) => {
    const user = await getAuthenticatedUserInfo()
    
    dispatch(setUserInfo(user))
    dispatch(setLoginStatus(true))

    return user
  }
}

export const logoutUser = () => async (dispatch: any) => {
  try {
    await logout()
    dispatch(clearUserInfo())
    dispatch(setLoginStatus(false))
    RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
  } catch (error) {
    Alert.alert('Error', error.message, [])
  }
}
