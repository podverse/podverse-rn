import { Image, View } from 'react-native'
import Config from 'react-native-config'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator, NavigationStackOptions, NavigationStackProp } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import React, { Component } from 'react'
import { DownloadsActiveBadge, ErrorBoundary, PVTabBar, TabBarLabel } from './components'
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
  SettingsScreenNotifications,
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
import { darkTheme } from './styles'
import { PodcastInfoScreen } from './screens/PodcastInfoScreen'
import { translate } from './lib/i18n'

const defaultNavigationOptions = () => {
  return {
    headerStyle: { backgroundColor: PV.Colors.ink, shadowColor: 'transparent' },
    title: PV.Tabs.Podcasts.title,
    headerTintColor: darkTheme.text.color,
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  //   headerRight: () => <NavSearchIcon navigation={navigation} />,
  //   // Prevent white screen flash on navigation on Android
  //   ...(Platform.OS === 'android' ? { animationEnabled: false } : {}),
  //   ...(Platform.OS === 'android' ? { backgroundColor: 'transparent' } : {})
  } as NavigationStackOptions
}

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
  },
  {
    defaultNavigationOptions,
    initialRouteName: PV.RouteNames.PodcastsScreen,
    navigationOptions: {
      // tabBarAccessibilityLabel: translate('Episodes'),
      tabBarIcon: ({ tintColor }: { tintColor: any }) => (
        <Image source={PV.Tabs.Podcasts.icon} style={{ tintColor }} resizeMode={'contain'} />
      ),
      tabBarLabel: (props) => <TabBarLabel {...props} tabKey='Podcasts' />,
      tabBarTestID: 'tab_podcasts_screen'.prependTestId()
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
  },
  {
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }: { tintColor: any }) => (
        <Image source={PV.Tabs.Episodes.icon} style={{ tintColor }} resizeMode={'contain'} />
      ),
      // tabBarAccessibilityLabel: translate('Episodes'),
      tabBarLabel: (props) => <TabBarLabel {...props} tabKey='Episodes' />,
      tabBarTestID: 'tab_episodes_screen'.prependTestId()
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
      // tabBarAccessibilityLabel: translate('Clips'),
      tabBarIcon: ({ tintColor }: { tintColor: any }) =>
        <Image source={PV.Tabs.Clips.icon} style={{ tintColor }} resizeMode={'contain'} />,
      tabBarLabel: (props) => <TabBarLabel {...props} tabKey='Clips' />,
      tabBarTestID: 'tab_clips_screen'.prependTestId()
    }
  }
)

const SearchNavigator = createStackNavigator(
  {
    [PV.RouteNames.SearchScreen]: { screen: SearchScreen, path: '' }
  },
  {
    defaultNavigationOptions
  }
)

const FilterNavigator = createStackNavigator(
  {
    [PV.RouteNames.FilterScreen]: { screen: FilterScreen, path: '' }
  },
  {
    defaultNavigationOptions
  }
)

const MoreNavigator = createStackNavigator(
  {
    [PV.RouteNames.MoreScreen]: MoreScreen,
    [PV.RouteNames.SettingsScreen]: SettingsScreen,
    [PV.RouteNames.SettingsScreenAccount]: SettingsScreenAccount,
    [PV.RouteNames.SettingsScreenAdvanced]: SettingsScreenAdvanced,
    [PV.RouteNames.SettingsScreenOther]: SettingsScreenOther,
    [PV.RouteNames.SettingsScreenDownloads]: SettingsScreenDownloads,
    [PV.RouteNames.SettingsScreenHistory]: SettingsScreenHistory,
    [PV.RouteNames.SettingsScreenNotifications]: SettingsScreenNotifications,
    [PV.RouteNames.SettingsScreenPlayer]: SettingsScreenPlayer,
    [PV.RouteNames.SettingsScreenQueue]: SettingsScreenQueue,
    [PV.RouteNames.SettingsScreenTracking]: SettingsScreenTracking,
    [PV.RouteNames.MembershipScreen]: {
      screen: MembershipScreen,
      path: PV.DeepLinks.Membership.path
    },
    [PV.RouteNames.AppModeScreen]: AppModeScreen,
    [PV.RouteNames.ContactScreen]: {
      screen: ContactScreen,
      path: PV.DeepLinks.Contact.path
    },
    [PV.RouteNames.ContactXMPPChatScreen]: {
      screen: ContactXMPPChatScreen,
      path: PV.DeepLinks.XMPP.path
    },
    [PV.RouteNames.ContributeScreen]: {
      screen: ContributeScreen,
      path: PV.DeepLinks.Contribute.path
    },
    [PV.RouteNames.AboutScreen]: {
      screen: AboutScreen,
      path: PV.DeepLinks.About.path
    },
    [PV.RouteNames.TermsOfServiceScreen]: {
      screen: TermsOfServiceScreen,
      path: PV.DeepLinks.Terms.path
    },
    [PV.RouteNames.PrivacyPolicyScreen]: PrivacyPolicyScreen,
    [PV.RouteNames.FAQScreen]: FAQScreen,
    [PV.RouteNames.V4VProvidersScreen]: V4VProvidersScreen,
    [PV.RouteNames.V4VProvidersAlbyScreen]: V4VProvidersAlbyScreen,
    [PV.RouteNames.V4VInfoStreamingSatsScreen]: V4VInfoStreamingSatsScreen
  },
  {
    defaultNavigationOptions,
    initialRouteName: PV.RouteNames.MoreScreen,
    navigationOptions: {
      // tabBarAccessibilityLabel: translate('More'),
      tabBarIcon: ({ tintColor }: { tintColor: any }) => {
        return (
          <View>
            <Image source={PV.Tabs.More.icon} style={{ tintColor }} resizeMode={'contain'} />
          </View>
        )
      },
      tabBarLabel: (props) => <TabBarLabel {...props} tabKey='More' />,
      tabBarTestID: 'tab_more_screen'.prependTestId()
    }
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
  },
  {
    initialRouteName: PV.RouteNames.MyLibraryScreen,
    defaultNavigationOptions,
    navigationOptions: {
      tabBarAccessibilityLabel: translate('My Library'),
      // eslint-disable-next-line react/prop-types
      tabBarIcon: ({ tintColor }: { tintColor: any }) => {
        return (
          <View>
            <Image source={PV.Tabs.MyLibrary.icon} style={{ tintColor }} resizeMode={'contain'} />
            <DownloadsActiveBadge />
          </View>
        )
      },
      tabBarLabel: (props) => <TabBarLabel {...props} tabKey='My Library' />,
      tabBarTestID: 'tab_my_library_screen'.prependTestId()
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

const TabNavigator = createBottomTabNavigator(tabs, {
  tabBarComponent: (props: any) => <PVTabBar {...props} />,
  tabBarOptions: {
    safeAreaInset: {
      bottom: 'never'
    }
  }
})

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
    [PV.RouteNames.TabNavigator]: { screen: TabNavigator, path: '' },
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
