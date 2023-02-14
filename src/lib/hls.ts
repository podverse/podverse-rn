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
              uri: replaceUriInUrl(p.uri, url)
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

const replaceUriInUrl = (uri: string, url: string) => {
  let finalUrl = url
  if (uri && url) {
    finalUrl = url.substring(0, url.lastIndexOf('/') + 1)
    finalUrl = finalUrl + uri
  }
  return finalUrl
}
