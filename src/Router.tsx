import { Image, View } from 'react-native'
import { Badge } from 'react-native-elements'
import { createAppContainer, createStackNavigator, createSwitchNavigator,
  NavigationScreenOptions } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import React, { getGlobal } from 'reactn'
import { NavQueueIcon, PVTabBar } from './components'
import { PV } from './resources'
import { AboutScreen, AuthScreen, ClipsScreen, DownloadsScreen, EditPlaylistScreen, EditProfileScreen,
  EpisodeScreen, EpisodesScreen, FeedbackScreen, MakeClipScreen, MembershipScreen, MoreScreen, OnboardingScreen,
  PlayerScreen, PlaylistsAddToScreen, PlaylistScreen, PlaylistsScreen, PodcastScreen, PodcastsScreen,
  ProfileScreen, ProfilesScreen, QueueScreen, SearchScreen, SettingsScreen, WebPageScreen } from './screens'

const defaultNavigationOptions = ({ navigation }) => ({
  title: PV.Tabs.Podcasts.title,
  headerStyle: {
    backgroundColor: PV.Colors.brandColor
  },
  headerTintColor: PV.Colors.white,
  headerTitleStyle: {
    fontWeight: 'bold'
  },
  headerRight: <NavQueueIcon navigation={navigation} />
}) as NavigationScreenOptions

const AuthNavigator = createStackNavigator(
  {
    [PV.RouteNames.AuthScreen]: AuthScreen
  }, {
    headerMode: 'none'
  }
)

const PodcastsNavigator = createStackNavigator(
  {
    [PV.RouteNames.PodcastsScreen]: { screen: PodcastsScreen, path: PV.DeepLinks.Podcasts.path },
    [PV.RouteNames.PodcastScreen]: { screen: PodcastScreen, path: PV.DeepLinks.Podcast.path },
    [PV.RouteNames.EpisodeScreen]: { screen: EpisodeScreen, path: PV.DeepLinks.Episode.path }
  },
  {
    defaultNavigationOptions,
    initialRouteName: PV.RouteNames.PodcastsScreen,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Podcasts.icon}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const EpisodesNavigator = createStackNavigator(
  {
    [PV.RouteNames.EpisodesScreen]: EpisodesScreen,
    [PV.RouteNames.EpisodeScreen]: EpisodeScreen,
    [PV.RouteNames.EpisodePodcastScreen]: PodcastScreen
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Episodes.icon}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const ClipsNavigator = createStackNavigator(
  {
    [PV.RouteNames.ClipsScreen]: ClipsScreen
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Clips.icon}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const SearchNavigator = createStackNavigator(
  {
    [PV.RouteNames.SearchScreen]: { screen: SearchScreen, path: '' },
    [PV.RouteNames.SearchPodcastScreen]: PodcastScreen,
    [PV.RouteNames.SearchEpisodeScreen]: EpisodeScreen
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Search.icon}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const MoreNavigator = createStackNavigator(
  {
    [PV.RouteNames.MoreScreen]: MoreScreen,
    [PV.RouteNames.DownloadsScreen]: DownloadsScreen,
    [PV.RouteNames.MyProfileScreen]: ProfileScreen,
    [PV.RouteNames.PlaylistScreen]: { screen: PlaylistScreen, path: PV.DeepLinks.Playlist.path },
    [PV.RouteNames.PlaylistsScreen]: { screen: PlaylistsScreen, path: PV.DeepLinks.Playlists.path },
    [PV.RouteNames.EditPlaylistScreen]: EditPlaylistScreen,
    [PV.RouteNames.EditProfileScreen]: EditProfileScreen,
    [PV.RouteNames.ProfileScreen]: { screen: ProfileScreen, path: PV.DeepLinks.Profile.path },
    [PV.RouteNames.ProfilesScreen]: { screen: ProfilesScreen, path: PV.DeepLinks.Profiles.path },
    [PV.RouteNames.SettingsScreen]: SettingsScreen,
    [PV.RouteNames.MoreEpisodeScreen]: EpisodeScreen,
    [PV.RouteNames.MorePlaylistScreen]: PlaylistScreen,
    [PV.RouteNames.MorePodcastScreen]: PodcastScreen,
    [PV.RouteNames.MembershipScreen]: MembershipScreen,
    [PV.RouteNames.FeedbackScreen]: FeedbackScreen,
    [PV.RouteNames.AboutScreen]: AboutScreen
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => {
        return (
          <View>
            <Image
              source={PV.Tabs.More.icon}
              style={{ tintColor }}
              resizeMode='contain' />
            <DownloadsActiveTabBadge />
          </View>
        )
      }
    }
  }
)

const DownloadsActiveTabBadge = () => {
  const { downloadsActive } = getGlobal()
  let downloadsActiveCount = 0
  for (const id of Object.keys(downloadsActive)) {
    if (downloadsActive[id]) downloadsActiveCount++
  }

  return (
    <View style={{
      position: 'absolute',
      top: 3,
      right: -5,
      zIndex: 1000000 }}>
      {
        downloadsActiveCount > 0 &&
          <Badge
            badgeStyle={{ borderWidth: 0 }}
            textStyle={{ fontSize: PV.Fonts.sizes.sm }}
            status='error'
            value={downloadsActiveCount} />
      }
    </View>
  )
}

const OnboardingNavigator = createStackNavigator({
  [PV.RouteNames.OnboardingScreen]: OnboardingScreen,
  [PV.RouteNames.AuthNavigator]: AuthNavigator
}, {
  initialRouteName: PV.RouteNames.OnboardingScreen,
  mode: 'modal',
  headerMode: 'none'
})

const TabNavigator = createBottomTabNavigator({
  Podcasts: { screen: PodcastsNavigator, path: '' },
  Episodes: EpisodesNavigator,
  Clips: ClipsNavigator,
  Search: { screen: SearchNavigator, path: PV.DeepLinks.Search.path },
  More: { screen: MoreNavigator, path: '' }
}, {
  tabBarComponent: (props: any) => <PVTabBar {...props} />
})

const PlayerNavigator = createStackNavigator({
  [PV.RouteNames.PlayerScreen]: { screen: PlayerScreen, path: PV.DeepLinks.Clip.path },
  [PV.RouteNames.MakeClipScreen]: MakeClipScreen
}, {
  defaultNavigationOptions
})

const PlaylistsAddToNavigator = createStackNavigator({
  [PV.RouteNames.PlaylistsAddToScreen]: PlaylistsAddToScreen
}, {
  defaultNavigationOptions
})

const QueueNavigator = createStackNavigator({
  [PV.RouteNames.QueueScreen]: QueueScreen
}, {
  defaultNavigationOptions
})

const WebPageNavigator = createStackNavigator({
  [PV.RouteNames.WebPageScreen]: WebPageScreen
}, {
  defaultNavigationOptions
})

const MainApp = createStackNavigator({
  [PV.RouteNames.TabNavigator]: { screen: TabNavigator, path: '' },
  [PV.RouteNames.AuthNavigator]: AuthNavigator,
  [PV.RouteNames.PlayerNavigator]: { screen: PlayerNavigator, path: '' },
  PlaylistsAddToNavigator,
  QueueNavigator,
  WebPageNavigator
}, {
  mode: 'modal',
  headerMode: 'none'
})

const SwitchNavigator = createSwitchNavigator({
  MainApp: { screen: MainApp, path: '' },
  Onboarding: OnboardingNavigator
}, {
  initialRouteName: PV.RouteNames.MainApp
})

const App = createAppContainer(SwitchNavigator)
const prefix = PV.DeepLinks.prefix

export default () => <App uriPrefix={prefix} />
