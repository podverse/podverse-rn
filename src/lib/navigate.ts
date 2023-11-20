import { convertNowPlayingItemToEpisode, NowPlayingItem, Podcast } from 'podverse-shared'
import { NavigationActions, StackActions } from 'react-navigation'
import { PV } from '../resources'
import { getSavedQueryPodcastScreen, PodcastScreenSavedQuery } from '../services/savedQueryFilters'
import { hasValidNetworkConnection } from './network'

/*
  Navigate to the EpisodeScreen located within the PodcastsStackNavigator.
 */
export const navigateToEpisodeScreenInPodcastsStackNavigatorWithIds = (
  navigation: any,
  podcastId: string,
  episodeId: string
) => {
  navigateBackToRoot(navigation)
  handlePodcastScreenNavigateWithParams(
    navigation,
    podcastId,
    null,
    { forceRequest: true }
  )
  setTimeout(() => {
    navigation.navigate({
      routeName: PV.RouteNames.EpisodeScreen,
      params: {
        episodeId
      }
    })
  }, 1000)
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
export const navigateToPodcastScreenWithItem = async (navigation: any, item: NowPlayingItem) => {

  let savedQuery: PodcastScreenSavedQuery = {}
  if (item?.podcastId) {
    savedQuery = await getSavedQueryPodcastScreen(item.podcastId)
  }

  const hasInternetConnection = await hasValidNetworkConnection()
  const isSerial = item?.podcastItunesFeedType === 'serial'

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
        },
        savedQuery,
        isSerial,
        hasInternetConnection
      }
    })
  )
}

/*
  Navigate to the PodcastScreen located within the PodcastsStackNavigator,
  and populate it with podcast data from an object of type podcast.
 */
export const navigateToPodcastScreenWithPodcast = async (navigation: any, podcast: any, viewType?: string) => {
  let savedQuery: PodcastScreenSavedQuery = {}
  if (podcast?.id) {
    savedQuery = await getSavedQueryPodcastScreen(podcast.id)
  }

  const hasInternetConnection = await hasValidNetworkConnection()
  const isSerial = podcast?.itunesFeedType === 'serial'

  navigation.dismiss()
  navigation.dispatch(NavigationActions.navigate({ routeName: PV.RouteNames.PodcastsScreen }))
  navigation.dispatch(
    NavigationActions.navigate({
      routeName: PV.RouteNames.PodcastScreen,
      params: {
        podcast,
        viewType,
        savedQuery,
        isSerial,
        hasInternetConnection
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

/*
  handlePodcastScreenNavigateWithParams
  the PodcastScreen requires some params passed in the navigation header
  in order to load with the correct filters on initial render
*/
type PodcastScreenNavigateWithParamsOptions = {
  forceRequest?: boolean
}
export const handlePodcastScreenNavigateWithParams = async (
  navigation: any,
  podcastId: string,
  podcast?: Podcast | null,
  options?: PodcastScreenNavigateWithParamsOptions
) => {
  let savedQuery: PodcastScreenSavedQuery = {}
  if (podcast?.id) {
    savedQuery = await getSavedQueryPodcastScreen(podcast.id)
  }

  const hasInternetConnection = await hasValidNetworkConnection()
  const isSerial = podcast?.itunesFeedType === 'serial'

  navigation.navigate(PV.RouteNames.PodcastScreen, {
    podcast,
    podcastId,
    addByRSSPodcastFeedUrl: podcast?.addByRSSPodcastFeedUrl,
    savedQuery,
    isSerial,
    hasInternetConnection,
    forceRequest: options?.forceRequest
  })
}

/*
  handleAlbumScreenNavigateWithParams
  the AlbumScreen requires some params passed in the navigation header
  in order to load with the correct filters on initial render
*/
type AlbumScreenNavigateWithParamsOptions = {
  forceRequest?: boolean
}
export const handleAlbumScreenNavigateWithParams = async (
  navigation: any,
  podcastId: string,
  podcast?: Podcast | null,
  options?: AlbumScreenNavigateWithParamsOptions
) => {
  const hasInternetConnection = await hasValidNetworkConnection()

  navigation.navigate(PV.RouteNames.AlbumScreen, {
    podcast,
    podcastId,
    addByRSSPodcastFeedUrl: podcast?.addByRSSPodcastFeedUrl,
    hasInternetConnection,
    forceRequest: options?.forceRequest
  })
}

/*
  Navigate to the AlbumScreen located within the MyLibraryStackNavigator.
 */
  export const navigateToAlbumScreenWithNowPlayingItem = (
    navigation: any,
    item: NowPlayingItem
  ) => {
    const episode = convertNowPlayingItemToEpisode(item)
    const podcast = episode?.podcast
    navigateToAlbumScreenWithPodcast(navigation, podcast, item.addByRSSPodcastFeedUrl)
  }

  export const navigateToAlbumScreenWithPodcast =
    async (navigation: any, podcast: any, addByRSSPodcastFeedUrl?: string) => {
    const hasInternetConnection = await hasValidNetworkConnection()
    navigateBackToRoot(navigation)

    navigation.navigate({ routeName: PV.RouteNames.MyLibraryScreen })
    setTimeout(() => {
      navigation.navigate({ routeName: PV.RouteNames.AlbumsScreen })
      setTimeout(() => {
        navigation.navigate({
          routeName: PV.RouteNames.AlbumScreen,
          params: {
            podcast,
            podcastId: podcast?.id,
            podcastTitle: podcast?.title,
            addByRSSPodcastFeedUrl,
            hasInternetConnection,
            forceRequest: false
          }
        })
      }, 333)
    }, 333)
  }