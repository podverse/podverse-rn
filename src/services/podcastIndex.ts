import { request } from './request'

export const getPodcastFromPodcastIndexById = async (id: string) => {
  const response = await request({
    endpoint: `/podcast-index/podcast/by-id/${id}`
  })

  return response && response.data
}
