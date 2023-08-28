import { Buffer } from 'buffer'
import { getExtensionFromUrl } from 'podverse-shared'
import { getPathFromUrl } from './utility'

export const base64Encode = (str: string) => {
  const buffer = Buffer.from(str).toString('base64')
  return buffer
}

/*
  Hashed media file paths must be limited to 250 characters
  for parseAddByRSSPodcast to save custom file name hashes.
  We also remove the query param part of the url, since those
  can sometimes contain auth tokens and params that change frequently.
*/
export const downloadCustomFileNameId = (url: string, options?: { charOffset?: number; useFullUrl?: boolean }) => {
  const extensionOffset = options?.charOffset || getExtensionFromUrl(url)?.length || 0
  const charLimit = 250 - extensionOffset
  const urlPath = options?.useFullUrl ? url : getPathFromUrl(url)
  const buffer = base64Encode(urlPath)
  return buffer?.substring(0, charLimit)
}
