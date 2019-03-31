import { request } from './request'

export const getMediaRefs = async (episodeId: string, nsfwMode: boolean) => {
  const response = await request({
    endpoint: '/mediaRef',
    query: {
      sort: 'most-recent',
      episodeId,
      page: 1
    }
  }, nsfwMode)

  return response.json()
}
