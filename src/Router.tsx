import React from 'react'
import { Image } from 'react-native'
import { createAppContainer, createStackNavigator, createSwitchNavigator, NavigationScreenOptions
  } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
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
    [PV.RouteNames.PodcastsScreen]: { screen: PodcastsScreen, path: 'podcasts' },
    [PV.RouteNames.PodcastScreen]: { screen: PodcastScreen, path: 'podcast/:podcastId' },
    [PV.RouteNames.EpisodeScreen]: { screen: EpisodeScreen, path: 'episode/' }
  },
  {
    defaultNavigationOptions,
    initialRouteName: PV.RouteNames.PodcastsScreen,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Podcasts.icon}
          height={25}
          width={25}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const EpisodesNavigator = createStackNavigator(
  {
    [PV.RouteNames.EpisodesScreen]: { screen: EpisodesScreen, path: 'list' },
    [PV.RouteNames.EpisodeScreen]: EpisodeScreen
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Episodes.icon}
          height={25}
          width={25}
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
          height={25}
          width={25}
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
          height={25}
          width={25}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const MoreNavigator = createStackNavigator(
  {
    [PV.RouteNames.MoreScreen]: { screen: MoreScreen, path: '/' },
    [PV.RouteNames.DownloadsScreen]: { screen: DownloadsScreen, path: 'downloads' },
    [PV.RouteNames.MyProfileScreen]: ProfileScreen,
    [PV.RouteNames.PlaylistScreen]: { screen: PlaylistScreen, path: 'playlist' },
    [PV.RouteNames.PlaylistsScreen]: { screen: PlaylistsScreen, path: 'playlists' },
    [PV.RouteNames.EditPlaylistScreen]: EditPlaylistScreen,
    [PV.RouteNames.EditProfileScreen]: EditProfileScreen,
    [PV.RouteNames.ProfileScreen]: { screen: ProfileScreen, path: 'profile' },
    [PV.RouteNames.ProfilesScreen]: { screen: ProfilesScreen, path: 'profiles' },
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
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.More.icon}
          height={25}
          width={25}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

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
  Search: { screen: SearchNavigator, path: 'search' },
  More: { screen: MoreNavigator, path: '' }
}, {
  tabBarComponent: (props: any) => <PVTabBar {...props} />,
  tabBarOptions: {
    inactiveTintColor: PV.Colors.grayDark,
    activeTintColor: PV.Colors.brandColor
  }
})

const PlayerNavigator = createStackNavigator({
  [PV.RouteNames.PlayerScreen]: { screen: PlayerScreen, path: 'clip/:mediaRefId' },
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
const prefix = 'podverse://'

export default () => <App uriPrefix={prefix} />
