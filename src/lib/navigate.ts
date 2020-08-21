import { NavigationActions, StackActions } from 'react-navigation'
import { PV } from '../resources'

const navigateToEpisodeScreenParams = (item: any) => ({
  episodeId: item.episodeId,
  episode: {
    id: item.episodeId,
    title: item.episodeTitle,
    podcast: {
      imageUrl: item.podcastImageUrl,
      title: item.podcastTitle
    }
  }
})

export const navigateToPodcastsEpisodeScreenWithItem = (navigation: any, item: any) => {
  navigation.navigate(PV.RouteNames.EpisodeScreen, navigateToEpisodeScreenParams(item))
}

export const navigateToEpisodeScreenWithItem = (navigation: any, item: any) => {
  const resetAction = StackActions.reset({
    index: 1,
    actions: [
      NavigationActions.navigate({ routeName: PV.RouteNames.EpisodesScreen }),
      NavigationActions.navigate({
        routeName: PV.RouteNames.EpisodeScreen,
        params: navigateToEpisodeScreenParams(item)
      })
    ],
    key: 'Episodes'
  })

  navigation.dispatch(resetAction)
}

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
