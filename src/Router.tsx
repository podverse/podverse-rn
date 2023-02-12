import { Image, View } from 'react-native'
import Config from 'react-native-config'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator, NavigationStackProp } from 'react-navigation-stack'
// import { createBottomTabNavigator } from 'react-navigation-tabs'
import React, { Component } from 'react'
import { DownloadsActiveBadge, ErrorBoundary, TabBarLabel } from './components'
import { PV } from './resources'
import {
  AboutScreen,
  AddPodcastByRSSAuthScreen,
  AddPodcastByRSSScreen,
  AppModeScreen,
  AuthScreen,
  ClipsScreen,
  ContactScreen,
  ContactXMPPChatScreen,
  ContributeScreen,
  DownloadsScreen,
  EditPlaylistScreen,
  EditProfileScreen,
  EmailVerificationScreen,
  EpisodeMediaRefScreen,
  EpisodeScreen,
  EpisodesScreen,
  EpisodeTranscriptScreen,
  FAQScreen,
  FeatureVideosScreen,
  FilterScreen,
  FundingNowPlayingItemScreen,
  FundingPodcastEpisodeScreen,
  HistoryScreen,
  MakeClipScreen,
  MembershipScreen,
  MoreScreen,
  MyLibraryScreen,
  OnboardingScreen,
  PlayerScreen,
  PlaylistsAddToScreen,
  PlaylistScreen,
  PlaylistsScreen,
  PodcastScreen,
  PodcastsScreen,
  PrivacyPolicyScreen,
  ProfileScreen,
  ProfilesScreen,
  PurchasingScreen,
  QueueScreen,
  ResetPasswordScreen,
  // ScanQRCodeScreen,
  SearchScreen,
  SettingsScreen,
  SettingsScreenAccount,
  SettingsScreenAdvanced,
  SettingsScreenOther,
  SettingsScreenDownloads,
  SettingsScreenHistory,
  SettingsScreenPlayer,
  SettingsScreenQueue,
  SettingsScreenTracking,
  SleepTimerScreen,
  StartPodcastFromTimeScreen,
  TermsOfServiceScreen,
  TrackingConsentScreen,
  V4VBoostagramScreen,
  V4VConsentScreen,
  V4VInfoStreamingSatsScreen,
  V4VPreviewScreen,
  V4VProvidersScreen,
  V4VProvidersAlbyScreen,
  V4VProvidersAlbyLoginScreen,
  WebPageScreen
} from './screens'
import { PodcastInfoScreen } from './screens/PodcastInfoScreen'
import { translate } from './lib/i18n'

const AuthNavigator = createStackNavigator(
  {
    [PV.RouteNames.AuthScreen]: AuthScreen,
    [PV.RouteNames.ResetPasswordScreen]: ResetPasswordScreen
  },
  {
    defaultNavigationOptions
  }
)

const PodcastsNavigator = createStackNavigator(
  {
    [PV.RouteNames.PodcastsScreen]: {
      screen: PodcastsScreen,
      path: PV.DeepLinks.Podcasts.path
    },
    [PV.RouteNames.PodcastScreen]: {
      screen: PodcastScreen,
      path: PV.DeepLinks.Podcast.path
    },
    [PV.RouteNames.PodcastInfoScreen]: {
      screen: PodcastInfoScreen
    },
    [PV.RouteNames.EpisodeScreen]: {
      screen: EpisodeScreen,
      path: PV.DeepLinks.Episode.path
    },
    [PV.RouteNames.EpisodeMediaRefScreen]: {
      screen: EpisodeMediaRefScreen
    },
    [PV.RouteNames.EpisodeTranscriptScreen]: {
      screen: EpisodeTranscriptScreen
    }
  }
)

const EpisodesNavigator = createStackNavigator(
  {
    [PV.RouteNames.EpisodesScreen]: EpisodesScreen,
    [PV.RouteNames.EpisodeScreen]: EpisodeScreen,
    [PV.RouteNames.EpisodeMediaRefScreen]: {
      screen: EpisodeMediaRefScreen
    },
    [PV.RouteNames.EpisodeTranscriptScreen]: {
      screen: EpisodeTranscriptScreen
    }
  }
)

const ClipsNavigator = createStackNavigator(
  {
    [PV.RouteNames.ClipsScreen]: ClipsScreen
  }
)

const SearchNavigator = createStackNavigator(
  {
    [PV.RouteNames.SearchScreen]: { screen: SearchScreen, path: '' }
  }
)

const FilterNavigator = createStackNavigator(
  {
    [PV.RouteNames.FilterScreen]: { screen: FilterScreen, path: '' }
  }
)

const MyLibraryNavigator = createStackNavigator(
  {
    [PV.RouteNames.MyLibraryScreen]: MyLibraryScreen,
    [PV.RouteNames.HistoryScreen]: HistoryScreen,
    [PV.RouteNames.DownloadsScreen]: DownloadsScreen,
    [PV.RouteNames.PlaylistScreen]: {
      screen: PlaylistScreen,
      path: PV.DeepLinks.Playlist.path
    },
    [PV.RouteNames.QueueScreen]: QueueScreen,
    [PV.RouteNames.MyProfileScreen]: ProfileScreen,
    [PV.RouteNames.EditProfileScreen]: EditProfileScreen,
    [PV.RouteNames.PlaylistsScreen]: {
      screen: PlaylistsScreen,
      path: PV.DeepLinks.Playlists.path
    },
    [PV.RouteNames.EditPlaylistScreen]: EditPlaylistScreen,
    [PV.RouteNames.ProfilesScreen]: {
      screen: ProfilesScreen,
      path: PV.DeepLinks.Profiles.path
    },
    [PV.RouteNames.ProfileScreen]: {
      screen: ProfileScreen,
      path: PV.DeepLinks.Profile.path
    }
  }
)

const OnboardingNavigator = createStackNavigator(
  {
    [PV.RouteNames.OnboardingScreen]: OnboardingScreen,
    [PV.RouteNames.AuthNavigator]: AuthNavigator
  },
  {
    initialRouteName: PV.RouteNames.OnboardingScreen,
    mode: 'modal',
    headerMode: 'none'
  }
)

const V4VProvidersModals = createStackNavigator(
  {
    [PV.RouteNames.V4VProvidersAlbyLoginScreen]: V4VProvidersAlbyLoginScreen
  },
  {
    mode: 'modal',
    defaultNavigationOptions
  }
)

const allTabs = {
  Podcasts: {
    screen: PodcastsNavigator,
    path: ''
  },
  Episodes: EpisodesNavigator,
  'MyLibrary': { screen: MyLibraryNavigator, path: '' },
  // Remove this after the 'My Library' string is no longer used in NAV_STACK_TABS .env vars
  'My Library': { screen: MyLibraryNavigator, path: '' },
  Clips: ClipsNavigator,
  More: { screen: MoreNavigator, path: PV.DeepLinks.Search.path }
}

const tabsList = Config.NAV_STACK_TABS.split(',')

const tabs = {}
tabsList.forEach((tabName: string) => {
  tabs[tabName] = allTabs[tabName]
})

// const TabNavigator = createBottomTabNavigator(tabs, {
//   tabBar: (props: any) => <PVTabBar {...props} />,
//   tabBarOptions: {
//     safeAreaInset: {
//       bottom: 'never'
//     }
//   }
// })

const PlayerNavigator = createStackNavigator(
  {
    [PV.RouteNames.PlayerScreen]: {
      screen: PlayerScreen,
      path: PV.DeepLinks.Clip.path
    },
    [PV.RouteNames.MakeClipScreen]: { screen: MakeClipScreen, navigationOptions: { gestureEnabled: false } },
    [PV.RouteNames.QueueScreen]: QueueScreen,
    [PV.RouteNames.PlayerFAQScreen]: FAQScreen,
    [PV.RouteNames.PlayerMyProfileScreen]: ProfileScreen,
    [PV.RouteNames.PlayerMembershipScreen]: MembershipScreen,
    [PV.RouteNames.SleepTimerScreen]: SleepTimerScreen,
    [PV.RouteNames.FundingNowPlayingItemScreen]: FundingNowPlayingItemScreen,
    [PV.RouteNames.PlaylistsAddToScreen]: PlaylistsAddToScreen,
    [PV.RouteNames.V4VBoostagramPlayerScreen]: V4VBoostagramScreen
  },
  {
    defaultNavigationOptions
  }
)

const V4VBoostagramNavigator = createStackNavigator(
  {
    [PV.RouteNames.V4VBoostagramScreen]: V4VBoostagramScreen
  },
  {
    defaultNavigationOptions
  }
)

const PlaylistsAddToNavigator = createStackNavigator(
  {
    [PV.RouteNames.PlaylistsAddToScreenModal]: PlaylistsAddToScreen
  },
  {
    defaultNavigationOptions
  }
)

const FundingPodcastEpisodeNavigator = createStackNavigator(
  {
    [PV.RouteNames.FundingPodcastEpisodeScreen]: FundingPodcastEpisodeScreen
  },
  {
    defaultNavigationOptions
  }
)

const StartPodcastFromTimeNavigator = createStackNavigator(
  {
    [PV.RouteNames.StartPodcastFromTimeScreen]: StartPodcastFromTimeScreen
  },
  {
    defaultNavigationOptions
  }
)

const WebPageNavigator = createStackNavigator(
  {
    [PV.RouteNames.WebPageScreen]: WebPageScreen
  },
  {
    defaultNavigationOptions
  }
)

const EmailVerificationNavigator = createStackNavigator(
  {
    [PV.RouteNames.EmailVerificationScreen]: EmailVerificationScreen
  },
  {
    defaultNavigationOptions
  }
)

const PurchasingNavigator = createStackNavigator(
  {
    [PV.RouteNames.PurchasingScreen]: PurchasingScreen
  },
  {
    defaultNavigationOptions
  }
)

const AddPodcastByRSSURLNavigator = createStackNavigator(
  {
    [PV.RouteNames.AddPodcastByRSSScreen]: {
      screen: AddPodcastByRSSScreen,
      path: PV.DeepLinks.AddByRSSPodcastFeedUrl.path
    }
  },
  {
    defaultNavigationOptions
  }
)

const AddPodcastByRSSAuthNavigator = createStackNavigator(
  {
    [PV.RouteNames.AddPodcastByRSSAuthScreen]: AddPodcastByRSSAuthScreen
  },
  {
    defaultNavigationOptions
  }
)

const TrackingConsentNavigator = createStackNavigator(
  {
    [PV.RouteNames.TrackingConsentScreen]: TrackingConsentScreen
  },
  {
    defaultNavigationOptions
  }
)

// const ScanQRCodeScreenNavigator = createStackNavigator(
//   {
//     [PV.RouteNames.ScanQRCodeScreen]: {
//       screen: ScanQRCodeScreen
//     }
//   },
//   {
//     defaultNavigationOptions
//   }
// )

const V4VOnboardingNavigator = createStackNavigator(
  {
    [PV.RouteNames.V4VPreviewScreen]: {
      screen: V4VPreviewScreen
    },
    [PV.RouteNames.V4VConsentScreen]: {
      screen: V4VConsentScreen
    }
  },
  {
    defaultNavigationOptions
  }
)

const FeatureVideosStack = createStackNavigator({
  "FeatureVideosScreen":{screen:FeatureVideosScreen}
}, {
  defaultNavigationOptions,
  mode:"modal"
})

const MainApp = createStackNavigator(
  {
    [PV.RouteNames.AuthNavigator]: AuthNavigator,
    [PV.RouteNames.PlayerNavigator]: { screen: PlayerNavigator, path: '' },
    PlaylistsAddToNavigator,
    SearchNavigator,
    FilterNavigator,
    StartPodcastFromTimeNavigator,
    WebPageNavigator,
    EmailVerificationNavigator,
    PurchasingNavigator,
    // ScanQRCodeScreenNavigator,
    FeatureVideosStack,
    [PV.RouteNames.AddPodcastByRSSScreen]: {
      screen: AddPodcastByRSSURLNavigator,
      path: ''
    },
    AddPodcastByRSSAuthNavigator,
    V4VOnboardingNavigator,
    V4VProvidersModals,
    TrackingConsentNavigator,
    FundingPodcastEpisodeNavigator,
    V4VBoostagramNavigator
  },
  {
    mode: 'modal',
    headerMode: 'none'
  }
)

const SwitchNavigator = createSwitchNavigator(
  {
    MainApp: { screen: MainApp, path: '' },
    Onboarding: OnboardingNavigator
  },
  {
    initialRouteName: PV.RouteNames.MainApp
  }
)

type Props = {
  navigation: NavigationStackProp
}

type State = Record<string, unknown>

class AppNavigator extends Component<Props, State> {
  static router = SwitchNavigator.router
  render() {
    const { navigation } = this.props
    return (
      <ErrorBoundary navigation={navigation}>
        <SwitchNavigator navigation={navigation} />
      </ErrorBoundary>
    )
  }
}

const App = createAppContainer(AppNavigator)
const prefix = PV.DeepLinks.prefix

export default () => <App uriPrefix={prefix} theme="dark"/>
