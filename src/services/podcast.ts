import { request } from './request'

export const getPodcasts = async (ids: [string], nsfwMode: boolean) => {
  const response = await request({
    endpoint: '/podcast',
    query: {
      sort: 'alphabetical',
      podcastId: ids.join(','),
      page: 1
    }
  }, nsfwMode)

  return response.json()
}
