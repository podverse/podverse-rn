import { convertNowPlayingItemToEpisode, NowPlayingItem } from 'podverse-shared'
import { NavigationActions, StackActions } from 'react-navigation'
import { PV } from '../resources'

/*
  Navigate to the EpisodeScreen located within the PodcastsStackNavigator.
 */
export const navigateToEpisodeScreenInPodcastsStackNavigatorWithIds = (
  navigation: any,
  podcastId: string,
  episodeId: string
) => {
  navigateBackToRoot(navigation)
  navigation.navigate({
    routeName: PV.RouteNames.PodcastScreen,
    params: {
      podcastId,
      forceRequest: true
    }
  })
  navigation.navigate({
    routeName: PV.RouteNames.EpisodeScreen,
    params: {
      episodeId
    }
  })
}

/*
  Navigate to the EpisodeScreen located within the EpisodesStackNavigator.
 */
export const navigateToEpisodeScreenWithItem = (navigation: any, item: any) => {
  const episode = convertNowPlayingItemToEpisode(item)

  const resetAction = StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: PV.RouteNames.EpisodesScreen }),
      NavigationActions.navigate({
        routeName: PV.RouteNames.EpisodeScreen,
        params: {
          addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
          episodeId: item.episodeId,
          episode,
          includeGoToPodcast: true
        }
      })
    ],
    key: 'Episodes'
  })

  navigation.dispatch(resetAction)
}

/*
  Navigate to the EpisodeScreen located within the current stack navigator.
 */
export const navigateToEpisodeScreenWithItemInCurrentStack = (
  navigation: any,
  item: any,
  includeGoToPodcast?: boolean
) => {
  const episode = convertNowPlayingItemToEpisode(item)

  navigation.dispatch(
    NavigationActions.navigate({
      routeName: PV.RouteNames.EpisodeScreen,
      params: {
        addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
        episodeId: item.episodeId,
        episode,
        includeGoToPodcast
      }
    })
  )
}

/*
  Navigate to the PodcastScreen located within the PodcastsStackNavigator,
  and populate it with podcast data from an object of type NowPlayingItem.
 */
export const navigateToPodcastScreenWithItem = (navigation: any, item: NowPlayingItem) => {
  navigation.dismiss()
  navigation.dispatch(NavigationActions.navigate({ routeName: PV.RouteNames.PodcastsScreen }))
  navigation.dispatch(
    NavigationActions.navigate({
      routeName: PV.RouteNames.PodcastScreen,
      params: {
        addByRSSPodcastFeedUrl: item?.addByRSSPodcastFeedUrl,
        podcastId: item?.podcastId,
        podcast: {
          addByRSSPodcastFeedUrl: item?.addByRSSPodcastFeedUrl,
          id: item?.podcastId,
          title: item?.podcastTitle,
          imageUrl: item?.podcastImageUrl
        }
      }
    })
  )
}

/*
  Navigate to the PodcastScreen located within the PodcastsStackNavigator,
  and populate it with podcast data from an object of type podcast.
 */
export const navigateToPodcastScreenWithPodcast = (navigation: any, podcast: any, viewType?: string) => {
  navigation.dismiss()
  navigation.dispatch(NavigationActions.navigate({ routeName: PV.RouteNames.PodcastsScreen }))
  navigation.dispatch(
    NavigationActions.navigate({
      routeName: PV.RouteNames.PodcastScreen,
      params: {
        podcast,
        viewType
      }
    })
  )
}

export const navigateBackToRoot = (navigation: any) => {
  navigation.dismiss()
  navigation.goBack(null)
  navigation.goBack(null)
  navigation.goBack(null)
  navigation.goBack(null)
  navigation.goBack(null)
  navigation.navigate(PV.RouteNames.PodcastsScreen)
}
