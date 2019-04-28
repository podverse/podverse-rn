import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { PV } from '../resources'
import { request } from './request'

export const getAuthenticatedUserInfo = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/get-authenticated-user-info',
    method: 'POST',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    }
  })

  return response.json()
}

export const login = async (email: string, password: string) => {
  const response = await request({
    method: 'POST',
    endpoint: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()
  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}

export const sendResetPassword = async (email: string) => {
  const response = await request({
    endpoint: '/auth/send-reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email
    },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const signUp = async (email: string, password: string, name: string) => {
  const response = await request({
    endpoint: '/auth/sign-up',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password,
      name
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()

  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}
