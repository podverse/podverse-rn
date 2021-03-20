/* eslint-disable max-len */
import { getGlobal } from 'reactn'
import { gaTrackPageView } from './googleAnalytics'

export const trackPageView = async (path: string, title: string, titleToEncode?: string) => {
  try {
    const global = getGlobal()
    const { player } = global
    const nowPlayingItem = player.nowPlayingItem || {}
  
    const { clipId, clipTitle, episodeId, episodeTitle, podcastId, podcastTitle } = nowPlayingItem
    
    const finalTitle = `${title}${titleToEncode ? encodeURIComponent(titleToEncode) : ''}`

    const queryObj = {
      cd: finalTitle ? finalTitle : '',
      cg1: podcastTitle ? encodeURIComponent(podcastTitle) : '',
      cg2: podcastId ? podcastId : '',
      cg3: episodeTitle ? encodeURIComponent(episodeTitle) : '',
      cg4: episodeId ? episodeId : '',
      cg5: clipTitle ? encodeURIComponent(clipTitle) : '',
      cg6: clipId ? clipId : ''
    }
  
    await gaTrackPageView(path, finalTitle, queryObj)
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
