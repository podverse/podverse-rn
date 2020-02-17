export type NowPlayingItem = {
  addByRSSPodcastFeedUrl?: string
  clipEndTime?: number
  clipId?: string
  clipStartTime?: number
  clipTitle?: string
  episodeDescription?: string
  episodeId?: string
  episodeImageUrl?: string
  episodeLinkUrl?: string
  episodeMediaUrl?: string
  episodePubDate?: string
  episodeTitle?: string
  isPublic?: boolean
  ownerId?: string
  ownerIsPublic?: boolean
  ownerName?: string
  podcastAuthors?: string
  podcastCategories?: string
  podcastId?: string
  podcastImageUrl?: string
  podcastIsExplicit?: boolean
  podcastLinkUrl?: string
  podcastSortableTitle?: string
  podcastTitle?: string
  userPlaybackPosition?: number
}

export const cleanNowPlayingItem = (item: any) => {
  return {
    addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
    clipEndTime: item.clipEndTime,
    clipId: item.clipId,
    clipStartTime: item.clipStartTime,
    clipTitle: item.clipTitle,
    episodeDescription: item.episodeDescription,
    episodeId: item.episodeId,
    episodeImageUrl: item.episodeImageUrl,
    episodeLinkUrl: item.episodeLinkUrl,
    episodeMediaUrl: item.episodeMediaUrl,
    episodePubDate: item.episodePubDate,
    episodeTitle: item.episodeTitle,
    isPublic: item.isPublic,
    ownerId: item.ownerId,
    ownerIsPublic: item.ownerIsPublic,
    ownerName: item.ownerName,
    // podcastAuthors: item.podcastAuthors,
    // podcastCategories: item.podcastCategories,
    podcastId: item.podcastId,
    podcastImageUrl: item.podcastImageUrl,
    podcastIsExplicit: item.podcastIsExplicit,
    podcastLinkUrl: item.podcastLinkUrl,
    podcastSortableTitle: item.podcastSortableTitle,
    podcastTitle: item.podcastTitle,
    userPlaybackPosition: item.userPlaybackPosition
  }
}

export const convertNowPlayingItemToEpisode = (item: NowPlayingItem) => {
  return {
    description: item.episodeDescription,
    id: item.episodeId,
    linkUrl: item.episodeLinkUrl,
    mediaUrl: item.episodeMediaUrl,
    pubDate: item.episodePubDate,
    title: item.episodeTitle,
    podcast: {
      id: item.podcastId,
      imageUrl: item.podcastImageUrl,
      isExplicit: item.podcastIsExplicit,
      linkUrl: item.podcastLinkUrl,
      sortableTitle: item.podcastSortableTitle,
      title: item.podcastTitle
    }
  }
}

export const convertNowPlayingItemToMediaRef = (item: NowPlayingItem = {}) => {
  return {
    endTime: item.clipEndTime,
    episode: convertNowPlayingItemToEpisode(item),
    id: item.clipId,
    isPublic: item.isPublic,
    startTime: item.clipStartTime,
    title: item.clipTitle,
    owner: {
      id: item.ownerId,
      isPublic: item.ownerIsPublic,
      name: item.ownerName
    }
  }
}

export const convertNowPlayingItemClipToNowPlayingItemEpisode = (
  data: any,
  userPlaybackPosition = 0
) => {
  return {
    episodeDescription: data.episodeDescription,
    episodeId: data.episodeId,
    episodeLinkUrl: data.episodeLinkUrl,
    episodeMediaUrl: data.episodeMediaUrl,
    episodePubDate: data.episodePubDate,
    episodeTitle: data.episodeTitle,
    podcastId: data.podcastId,
    podcastImageUrl: data.podcastImageUrl,
    podcastIsExplicit: data.podcastIsExplicit,
    podcastLinkUrl: data.podcastLinkUrl,
    podcastSortableTitle: data.podcastSortableTitle,
    podcastTitle: data.podcastTitle,
    userPlaybackPosition: userPlaybackPosition || 0,
    addByRSSPodcastFeedUrl: data.addByRSSPodcastFeedUrl
  }
}

export const convertToNowPlayingItem = (
  data,
  inheritedEpisode = {} as any,
  inheritedPodcast = {} as any,
  userPlaybackPosition = 0
) => {
  const nowPlayingItem: NowPlayingItem = {}

  if (!data) {
    return {}
  }
  const e = (data.pubDate && data) || data.episode || inheritedEpisode
  const p =
    (data.episode && data.episode.podcast) || data.podcast || inheritedPodcast

  // If it has a podcast_id field, assume it is an Episode list item
  if (data.podcast_id) {
    nowPlayingItem.episodeDescription = data.description
    nowPlayingItem.episodeId = data.id
    nowPlayingItem.episodeLinkUrl = data.linkUrl
    nowPlayingItem.episodeMediaUrl = data.mediaUrl
    nowPlayingItem.episodePubDate = data.pubDate
    nowPlayingItem.episodeTitle = data.title
    nowPlayingItem.podcastId = data.podcast_id
    nowPlayingItem.podcastImageUrl = data.podcast_shrunkImageUrl || data.podcast_imageUrl
    nowPlayingItem.podcastLinkUrl = data.podcast_linkUrl
    nowPlayingItem.podcastSortableTitle = data.podcast_sortableTitle
    nowPlayingItem.podcastTitle = data.podcast_title
    nowPlayingItem.userPlaybackPosition = userPlaybackPosition || 0
    // If it has a pubDate field, assume it is an Episode
  } else if (data.pubDate) {
    nowPlayingItem.episodeDescription = data.description
    nowPlayingItem.episodeId = data.id
    nowPlayingItem.episodeLinkUrl = data.linkUrl
    nowPlayingItem.episodeMediaUrl = data.mediaUrl
    nowPlayingItem.episodePubDate = data.pubDate
    nowPlayingItem.episodeTitle = data.title
    nowPlayingItem.podcastId = p.id
    nowPlayingItem.podcastImageUrl = p.shrunkImageUrl || p.imageUrl
    nowPlayingItem.podcastIsExplicit = p.isExplicit
    nowPlayingItem.podcastLinkUrl = p.linkUrl
    nowPlayingItem.podcastSortableTitle = p.sortableTitle
    nowPlayingItem.podcastTitle = p.title
    nowPlayingItem.userPlaybackPosition = userPlaybackPosition || 0
    // Else assume it is a MediaRef
  } else {
    nowPlayingItem.clipEndTime = data.endTime
    nowPlayingItem.clipId = data.id
    nowPlayingItem.clipStartTime = data.startTime
    nowPlayingItem.clipTitle = data.title
    nowPlayingItem.episodeDescription = e.description
    nowPlayingItem.episodeId = e.id
    nowPlayingItem.episodeImageUrl = e.imageUrl
    nowPlayingItem.episodeLinkUrl = e.linkUrl
    nowPlayingItem.episodeMediaUrl = e.mediaUrl
    nowPlayingItem.episodePubDate = e.pubDate
    nowPlayingItem.episodeTitle = e.title
    nowPlayingItem.isPublic = data.isPublic
    nowPlayingItem.ownerId = data.owner && data.owner.id
    nowPlayingItem.ownerIsPublic = data.owner && data.owner.isPublic
    nowPlayingItem.ownerName = data.owner && data.owner.name
    nowPlayingItem.podcastAuthors = p.authors
    nowPlayingItem.podcastCategories = p.categories
    nowPlayingItem.podcastId = p.id
    nowPlayingItem.podcastIsExplicit = p.isExplicit
    nowPlayingItem.podcastImageUrl = p.shrunkImageUrl || p.imageUrl
    nowPlayingItem.podcastLinkUrl = p.linkUrl
    nowPlayingItem.podcastSortableTitle = p.sortableTitle
    nowPlayingItem.podcastTitle = p.title
    nowPlayingItem.userPlaybackPosition =
      userPlaybackPosition || data.clipStartTime || 0
  }

  nowPlayingItem.addByRSSPodcastFeedUrl = data.addByRSSPodcastFeedUrl || (inheritedPodcast && inheritedPodcast.addByRSSPodcastFeedUrl)

  return nowPlayingItem
}
