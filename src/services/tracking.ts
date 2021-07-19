/* eslint-disable max-len */
import { matomoTrackPageView } from './matomo'

export const trackPageView = async (path: string, title: string, titleToEncode?: string) => {
  try {
    const finalTitle = `${title}${titleToEncode ? encodeURIComponent(titleToEncode) : ''}`
    await matomoTrackPageView(path, finalTitle)
  } catch (error) {
    console.log('trackPageView error', error)
  }
}

export const trackPlayerScreenPageView = (item: any) => {
  try {
    if (item.clipId) {
      trackPageView(
        '/clip/' + item.clipId,
        'Player Screen - Clip - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle) + ' - ' + encodeURIComponent(item.clipTitle)
      )
    }
    if (item.episodeId) {
      trackPageView(
        '/episode/' + item.episodeId,
        'Player Screen - Episode - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle)
      )
    }
    if (item.podcastId) {
      trackPageView('/podcast/' + item.podcastId, 'Player Screen - Podcast - ' + encodeURIComponent(item.podcastTitle))
    }
  } catch (error) {
    console.log('trackPlayerScreenPageView error', error)
  }
}
