import * as m3u8Parser from 'm3u8-parser'
import { request } from '../services/request'
import { debugLogger } from './logger'

export type HLSManifest = {
  playlists: HLSPlaylist[]
  selectedPlaylist: HLSPlaylist | null
}

type HLSPlaylist = {
  height: number
  width: number
  uri: string
}

export const hlsGetParsedManifest = async (url: string, resolution = 720) => {
  let pvManifest: HLSManifest | null = null

  try {
    const response = await request({}, url)
    const manifest = response?.data || ''
    if (manifest) {
      const parser = new m3u8Parser.Parser()
      parser.push(manifest)
      parser.end()
      const parsedManifest = parser.manifest
      let playlists: HLSPlaylist[] = []

      if (parsedManifest?.playlists?.length) {
        for (const p of parsedManifest.playlists) {
          if (p?.attributes?.RESOLUTION) {
            playlists.push({
              height: p.attributes.RESOLUTION.height,
              width: p.attributes.RESOLUTION.width,
              uri: hlsReplaceUriInUrl(url, p.uri)
            })
          }
        }
      }

      playlists = playlists.sort((a, b) => b.height - a.height)

      const selectedPlaylist = playlists.find((x) => x.height === resolution) || playlists[0] || null

      pvManifest = {
        playlists,
        selectedPlaylist
      }
    }
  } catch (error) {
    debugLogger('hls getParsedHLSFile', error)
  }

  return pvManifest
}

const hlsReplaceUriInUrl = (base: string, relative: string) => {
  let finalUrl = ''
  if (relative?.startsWith('..')) {
    finalUrl = convertToAbsoluteUrl(base, relative)
  } else {      
    finalUrl = base.substring(0, base.lastIndexOf('/') + 1)
    finalUrl = finalUrl + relative
  }

  return finalUrl
}

/*
  Thanks to Bergi for this helper on StackOverflow.
  https://stackoverflow.com/a/14780463/2608858
*/
function convertToAbsoluteUrl(base: string, relative: string) {
  const stack = base.split('/')
  const parts = relative.split('/')
  stack.pop() // remove current file name (or empty string)
  // (omit if "base" is the current folder without trailing slash)
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }
  return stack.join('/')
}
