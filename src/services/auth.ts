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

// export const getLoggedInUserMediaRefs = async (bearerToken, nsfwMode, sort = 'most-recent', page = 1) => {
//   let filteredQuery: any = {}
//   filteredQuery.sort = sort
//   filteredQuery.page = page
//   const queryString = convertObjectToQueryString(filteredQuery)

//   return axios(`${API_BASE_URL}/auth/mediaRefs?${queryString}`, {
//     method: 'get',
//     headers: {
//       Authorization: bearerToken,
//       nsfwMode
//     },
//     credentials: 'include'
//   })
// }

// export const getLoggedInUserPlaylists = async (bearerToken, page = 1) => {
//   let filteredQuery: any = {}
//   filteredQuery.page = page
//   const queryString = convertObjectToQueryString(filteredQuery)

//   return axios(`${API_BASE_URL}/auth/playlists?${queryString}`, {
//     method: 'get',
//     data: {
//       page
//     },
//     headers: {
//       Authorization: bearerToken
//     },
//     credentials: 'include'
//   })
// }

export const login = async (email: string, password: string) => {
  const response = await request({
    method: 'POST',
    endpoint: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password
    },
    query: {
      includeBodyToken: true
    },
    opts: {
      credentials: 'include'
    }
  })

  const data = await response.json()
  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}

export const logout = async () => {
  return request({
    endpoint: '/auth/logout',
    method: 'POST',
    opts: {
      credentials: 'include'
    }
  })
}

// export const resetPassword = async (password?: string, resetPasswordToken?: string) => {
//   return fetch(`${API_BASE_URL}/auth/reset-password`, {
//     method: 'POST',
//     body: JSON.stringify({
//       password,
//       resetPasswordToken
//     })
//   })
// }

// export const sendResetPassword = async (email: string) => {
//   return fetch(`${API_BASE_URL}/auth/send-reset-password`, {
//     method: 'POST',
//     body: JSON.stringify({
//       email
//     })
//   })
// }

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
    query: {
      includeBodyToken: true
    },
    opts: { credentials: 'include' }
  })

  const data = await response.json()

  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}

// export const verifyEmail = async (token: string) => {
//   return fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`)
// }
