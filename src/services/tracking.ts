import { getGlobal } from 'reactn'
import { gaTrackPageView } from './googleAnalytics'

export const trackPageView = async (path: string, title: string) => {
  const global = getGlobal()
  const { player } = global
  const nowPlayingItem = player.nowPlayingItem || {}

  const { clipId, clipTitle, episodeId, episodeTitle, podcastId, podcastTitle } = nowPlayingItem

  const queryObj = {
    cd: title ? title : '',
    cg1: podcastTitle ? podcastTitle : '',
    cg2: podcastId ? podcastId : '',
    cg3: episodeTitle ? episodeTitle : '',
    cg4: episodeId ? episodeId : '',
    cg5: clipTitle ? clipTitle : '',
    cg6: clipId ? clipId : ''
  }

  await gaTrackPageView(path, title, queryObj)
}

export const trackPlayerScreenPageView = (item: any) => {
  if (item.clipId) {
    trackPageView(
      '/clip/' + item.clipId,
      'Player Screen - Clip - ' + item.podcastTitle + ' - ' + item.episodeTitle + ' - ' + item.clipTitle
    )
  }
  if (item.episodeId) {
    trackPageView(
      '/episode/' + item.episodeId,
      'Player Screen - Episode - ' + item.podcastTitle + ' - ' + item.episodeTitle
    )
  }
  if (item.podcastId) {
    trackPageView('/podcast/' + item.podcastId, 'Player Screen - Podcast - ' + item.podcastTitle)
  }
}
