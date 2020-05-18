import { PV } from '../resources'
import { request } from './request'

export const getEpisodes = async (query: any = {}, nsfwMode: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.podcastId ? { podcastId: query.podcastId } : {}),
    ...(query.searchAllFieldsText ? { searchAllFieldsText: query.searchAllFieldsText } : {}),
    ...(query.includePodcast ? { includePodcast: query.includePodcast } : {}),
    ...(query.sincePubDate ? { sincePubDate: query.sincePubDate } : {})
  } as any

  if (query.categories && query.categories !== PV.Filters._allCategoriesKey) {
    filteredQuery.categories = query.categories
  }

  if (query.subscribedOnly && query.podcastId && query.podcastId.length === 0) {
    return [[], 0]
  }

  const response = await request(
    {
      endpoint: '/episode',
      query: filteredQuery
    },
    nsfwMode
  )

  if (query.censorNSFWResults && response && response.data) {
    let results = response.data[0]
    results = results.map((x: any) => {
      x.title = x && x.title ? x.title.sanitize() : ''
      x.description = x && x.description && x.description.substr(0, 300)
      x.description = x && x.description ? x.description.sanitize() : ''
      return x
    })

    return [results, response.data[1]]
  } else {
    return response && response.data
  }
}

export const getEpisode = async (id: string) => {
  const response = await request({
    endpoint: `/episode/${id}`
  })

  return response && response.data
}
