import CryptoES from 'crypto-es'

// get a random string
export const pkceGenerateRandomString = (length: number) => {
  const salt = CryptoES.lib.WordArray.random(length)
  return salt.toString()
}

// Create a SHA256 of the code verifier and base64URL encode it. (note: this is not just base64 encoded)
export const pkceGenerateCodeChallenge = (codeVerifier: string) => {
  const digest = CryptoES.SHA256(codeVerifier)
  const encodedDigest = digest
    .toString(CryptoES.enc.Base64)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=+$/, '')
  return encodedDigest
}

// export const generateCodeChallengeFromVerifier = (verifier: string) => {
//   const hash = CryptoES.SHA256(verifier)
//   return hash
// }
