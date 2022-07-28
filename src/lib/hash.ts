import { Buffer } from 'buffer'
import { getExtensionFromUrl } from './utility'

export const base64Encode = (str: string) => {
  const buffer = Buffer.from(str).toString('base64')
  return buffer
}

/*
  Hashed media file paths must be limited to 254 characters
  for parseAddByRSSPodcast to save custom file name hashes.
*/
export const downloadCustomFileNameId = (url: string) => {
  const ext = getExtensionFromUrl(url) || ''
  const charLimit = 254 - ext.length
  const buffer = base64Encode(url)
  return buffer?.substring(0, charLimit)
}
