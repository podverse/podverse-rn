import { request } from './request'

export const getEpisodes = async (podcastId: string, nsfwMode: boolean) => {
  const response = await request({
    endpoint: '/episode',
    query: {
      sort: 'most-recent',
      podcastId,
      page: 1
    }
  }, nsfwMode)

  return response.json()
}
