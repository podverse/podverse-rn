
// @flow
const API_BASE_URL  = "https://api.stage.podverse.fm/api/v1"

type Request = {endpoint?: string, params?: Object, query?: string, body?: Object, headers?: Object, method?: string, opts?: Object}

const request = async (request: Request) => {
  const {
    endpoint = "",
    query = "",
    params = {},
    headers = {},
    body = {},
    method = "GET",
    opts = {}
  } = request

  return await fetch(`${API_BASE_URL}${endpoint}?${query}`, {params, headers, body, method, ...opts})
}

export const getAuthenticatedUserInfo = async (bearerToken: string) => {
  return await fetch(`${API_BASE_URL}/auth/get-authenticated-user-info`, {
    method: "POST",
    headers: {
      Authorization: bearerToken
    }
  })
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
  return await request({
    method: "POST",
    endpoint: "/auth/login",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email,
      password
    }),
    opts: {
      credentials: "include"
    }
  })
  // fetch(`${API_BASE_URL}/auth/login`, {
  //   method: "POST",
  //   headers: {"Content-Type": "application/json"},
  //   body: JSON.stringify({
  //     email,
  //     password
  //   }),
  //   credentials: "include"
  // })
}

export const logOut = async () => {
  return await fetch(`${API_BASE_URL}/auth/log-out`, {
    method: "POST",
    credentials: "include"
  })
}

export const resetPassword = async (password?: string, resetPasswordToken?: string) => {
  return await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    body: JSON.stringify({
      password,
      resetPasswordToken
    })
  })
}

export const sendResetPassword = async (email: string) => {
  return await fetch(`${API_BASE_URL}/auth/send-reset-password`, {
    method: "POST",
    body: JSON.stringify({
      email
    })
  })
}

export const signUp = async (email: string, password: string) => {
  return await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password
    }),
    credentials: "include"
  })
}

export const verifyEmail = async (token: string) => {
  return await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`)
}
