import { NavigationActions, StackActions } from 'react-navigation'
import { PV } from '../resources'

/*
  Navigate to the EpisodeScreen located within the EpisodesStackNavigator.
 */
export const navigateToEpisodeScreenWithItem = (navigation: any, item: any) => {
  const resetAction = StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: PV.RouteNames.EpisodesScreen }),
      NavigationActions.navigate({
        routeName: PV.RouteNames.EpisodesEpisodeScreen,
        params: {
          episodeId: item.episodeId,
          episode: {
            id: item.episodeId,
            title: item.episodeTitle,
            podcast: {
              imageUrl: item.podcastImageUrl,
              title: item.podcastTitle
            }
          },
          includeGoToPodcast: true
        }
      })
    ],
    key: 'Episodes'
  })

  navigation.dispatch(resetAction)
}

/*
  Navigate to the PodcastScreen located within the PodcastsStackNavigator,
  and populate it with podcast data from an object of type NowPlayingItem.
 */
export const navigateToPodcastScreenWithItem = (navigation: any, item: any) => {
  const resetAction = StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: PV.RouteNames.PodcastsScreen }),
      NavigationActions.navigate({
        routeName: PV.RouteNames.PodcastScreen,
        params: {
          addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
          podcastId: item.podcastId,
          podcast: {
            id: item.podcastId,
            title: item.podcastTitle,
            imageUrl: item.podcastImageUrl
          }
        }
      })
    ],
    key: 'Podcasts'
  })

  navigation.dispatch(resetAction)
}

/*
  Navigate to the PodcastScreen located within the PodcastsStackNavigator,
  and populate it with podcast data from an object of type podcast.
 */
export const navigateToPodcastScreenWithPodcast = (navigation: any, podcast: any, viewType: string) => {
  navigation.dismiss()

  const resetAction = StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: PV.RouteNames.PodcastsScreen }),
      NavigationActions.navigate({
        routeName: PV.RouteNames.PodcastScreen,
        params: {
          podcast,
          viewType
        }
      })
    ],
    key: 'Podcasts'
  })

  navigation.dispatch(resetAction)
}
