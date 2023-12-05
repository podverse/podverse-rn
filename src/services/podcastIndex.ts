import { ValueTag } from 'podverse-shared'
import { request } from './request'

export const getPodcastFromPodcastIndexById = async (id: string) => {
  const response = await request({
    endpoint: `/podcast-index/podcast/by-id/${id}`
  })

  return response && response.data
}

export const getValueTagsForFeedGuid = async (feedGuid: string) => {
  const response = await request({
    endpoint: `/podcast-index/value/by-guids`,
    query: {
      podcastGuid: feedGuid
    }
  })

  return response && response.data
}

export const getValueTagsForFeedGuidAndItemGuid = async (feedGuid: string, itemGuid: string) => {
  if (itemGuid.indexOf('http') === 0) {
    itemGuid = encodeURIComponent(itemGuid)
  }
  const response = await request({
    endpoint: `/podcast-index/value/by-guids`,
    query: {
      podcastGuid: feedGuid,
      episodeGuid: itemGuid
    }
  })

  return response && response.data
}

export const getValueTagsForItemGuidOrFeedGuid = async (feedGuid: string, itemGuid?: string) => {
  let valueTags: ValueTag[] = []
  try {
    if (itemGuid) {
      if (itemGuid.indexOf('http') === 0) {
        itemGuid = encodeURIComponent(itemGuid)
      }
      valueTags = await getValueTagsForFeedGuidAndItemGuid(feedGuid, itemGuid)
    } else {
      throw new Error('Not found')
    }
  } catch (error) {
    // console.log('getValueTagsForItemGuidOrFeedGuid getValueTagsForFeedGuidAndItemGuid error', error)
    try {
      valueTags = await getValueTagsForFeedGuid(feedGuid)
    } catch (error) {
      // console.log('getValueTagsForItemGuidOrFeedGuid getValueTagsForFeedGuid error', error)
    }
  }
  return valueTags
}

export const getEpisodeByGuidFromPodcastIndex = async (podcastIndexId: string, episodeGuid: string) => {
  if (episodeGuid.indexOf('http') === 0) {
    episodeGuid = encodeURIComponent(episodeGuid)
  }
  const response = await request({
    endpoint: `/podcast-index/episode/byguid`,
    query: {
      podcastIndexId,
      episodeGuid
    }
  })

  return response && response.data
}
