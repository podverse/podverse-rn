export type NowPlayingItem = {
  clipEndTime?: number
  clipId?: string
  clipStartTime?: number
  clipTitle?: string
  episodeDescription?: string
  episodeId?: string
  episodeImageUrl?: string
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
  podcastTitle?: string
  userPlaybackPosition?: number
}

export const convertToNowPlayingItem = (data, userPlaybackPosition = 0) => {
  let nowPlayingItem: NowPlayingItem = {}

  if (!data) { return {} }

  // If it has a podcast_id field, assume it is an Episode list item
  if (data.podcast_id) {
    nowPlayingItem.episodeDescription = data.description
    nowPlayingItem.episodeId = data.id
    nowPlayingItem.episodeMediaUrl = data.mediaUrl
    nowPlayingItem.episodePubDate = data.pubDate
    nowPlayingItem.episodeTitle = data.title
    nowPlayingItem.podcastImageUrl = data.podcast_imageUrl
    nowPlayingItem.podcastId = data.podcast_id
    nowPlayingItem.podcastIsExplicit = data.podcast_isExplicit
    nowPlayingItem.podcastTitle = data.podcast_title
    nowPlayingItem.userPlaybackPosition = userPlaybackPosition || 0
    // If it has a pubDate field, assume it is an Episode
  } else if (data.pubDate) {
    nowPlayingItem.episodeDescription = data.description
    nowPlayingItem.episodeId = data.id
    nowPlayingItem.episodeMediaUrl = data.mediaUrl
    nowPlayingItem.episodePubDate = data.pubDate
    nowPlayingItem.episodeTitle = data.title
    nowPlayingItem.podcastImageUrl = data.podcast && data.podcast.imageUrl
    nowPlayingItem.podcastId = data.podcast && data.podcast.id
    nowPlayingItem.podcastIsExplicit = data.podcast && data.podcast.isExplicit
    nowPlayingItem.podcastTitle = data.podcast && data.podcast.title
    nowPlayingItem.userPlaybackPosition = userPlaybackPosition || 0
    // Else assume it is a MediaRef
  } else {
    nowPlayingItem.clipEndTime = data.endTime
    nowPlayingItem.clipId = data.id
    nowPlayingItem.clipStartTime = data.startTime
    nowPlayingItem.clipTitle = data.title
    nowPlayingItem.episodeDescription = data.episode.description
    nowPlayingItem.episodeId = data.episode.id
    nowPlayingItem.episodeImageUrl = data.episode.imageUrl
    nowPlayingItem.episodeMediaUrl = data.episode.mediaUrl
    nowPlayingItem.episodePubDate = data.episode.pubDate
    nowPlayingItem.episodeTitle = data.episode.title
    nowPlayingItem.isPublic = data.isPublic
    nowPlayingItem.ownerId = data.owner && data.owner.id
    nowPlayingItem.ownerIsPublic = data.owner && data.owner.isPublic
    nowPlayingItem.ownerName = data.owner && data.owner.name
    nowPlayingItem.podcastAuthors = data.episode.podcast.authors
    nowPlayingItem.podcastCategories = data.episode.podcast.categories
    nowPlayingItem.podcastImageUrl = data.episode.podcast.imageUrl
    nowPlayingItem.podcastId = data.episode.podcast.id
    nowPlayingItem.podcastIsExplicit = data.episode.podcast.isExplicit
    nowPlayingItem.podcastTitle = data.episode.podcast.title
    nowPlayingItem.userPlaybackPosition = userPlaybackPosition || data.clipStartTime || 0
  }

  return nowPlayingItem
}
