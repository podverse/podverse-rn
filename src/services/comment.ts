import { convertThreadcapResponseToPVComment } from 'podverse-shared'
import { request } from './request'

export const getEpisodeProxyActivityPub = async (episodeId: string) => {
  const response = await request({
    endpoint: `/episode/${episodeId}/proxy/activity-pub`,
    method: 'get',
    opts: { timeout: 120000 }
  })

  const comment = convertThreadcapResponseToPVComment(response.data)
  comment.isRoot = true
  return comment
}

export const getEpisodeProxyTwitter = async (episodeId: string) => {
  const response = await request({
    endpoint: `/episode/${episodeId}/proxy/twitter`,
    method: 'get',
    opts: { timeout: 120000 }
  })

  const comment = convertThreadcapResponseToPVComment(response.data)
  comment.isRoot = true
  return comment
}
