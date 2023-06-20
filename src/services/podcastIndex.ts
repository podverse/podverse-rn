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
      valueTags = await getValueTagsForFeedGuidAndItemGuid(feedGuid, itemGuid)
    } else {
      throw new Error('Not found')
    }
  } catch (error) {
    valueTags = await getValueTagsForFeedGuid(feedGuid)
    console.log('getValueTagsForItemGuidOrFeedGuid error', error)
  }
  return valueTags
}
