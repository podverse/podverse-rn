// Thank you to Putri Karunia and zeterain for this code shared on Stack Overflow!
// https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs

/* Generate code verifier */

const dec2hex = (dec) => {
  return ('0' + dec.toString(16)).substr(-2)
}

export const generateCodeVerifier = () => {
  const array = new Uint32Array(56 / 2)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec2hex).join('')
}

/* ------------- */

/* Generate code challenge from code verifier */

const sha256 = (plain) => {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64urlencode = (a) => {
  let str = ''
  const bytes = new Uint8Array(a)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const generateCodeChallengeFromVerifier = async (v) => {
  try {
    const hashed = await sha256(v)
    const base64encoded = base64urlencode(hashed)
    return base64encoded
  } catch (error) {
    console.log('generateCodeChallengeFromVerifier error:', error)
  }
}
