import React from 'react'
import { Image } from 'react-native'
import {
  createAppContainer, createStackNavigator, createSwitchNavigator,
  NavigationScreenOptions
} from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { PVTabBar } from './components'
import { PV } from './resources'
import {
  AuthScreen, ClipsScreen, EpisodeScreen, EpisodesScreen, FindScreen, MoreScreen,
  OnboardingScreen, PodcastScreen, PodcastsScreen, SettingsScreen
} from './screens'
import { colors } from './styles'

const defaultNavigationOptions = {
  title: PV.Tabs.Podcasts.title,
  headerStyle: {
    backgroundColor: colors.brandColor
  },
  headerTintColor: colors.text.primary,
  headerTitleStyle: {
    fontWeight: 'bold'
  }
} as NavigationScreenOptions

const cardStyle = {
  backgroundColor: colors.app.backgroundColor
}

const AuthNavigator = createStackNavigator(
  {
    [PV.RouteNames.AuthScreen]: AuthScreen
  }, {
    headerMode: 'none'
  }
)

const PodcastsNavigator = createStackNavigator(
  {
    [PV.RouteNames.PodcastsScreen]: PodcastsScreen,
    [PV.RouteNames.PodcastScreen]: PodcastScreen,
    [PV.RouteNames.EpisodeScreen]: EpisodeScreen
  },
  {
    cardStyle,
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
    [PV.RouteNames.EpisodesScreen]: EpisodesScreen,
    [PV.RouteNames.EpisodeScreen]: EpisodeScreen
  },
  {
    cardStyle,
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
    cardStyle,
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

const FindNavigator = createStackNavigator(
  {
    [PV.RouteNames.FindScreen]: FindScreen
  },
  {
    cardStyle,
    defaultNavigationOptions,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Find.icon}
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
    [PV.RouteNames.MoreScreen]: MoreScreen,
    [PV.RouteNames.SettingsScreen]: SettingsScreen
  },
  {
    cardStyle,
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
  Podcasts: PodcastsNavigator,
  Episodes: EpisodesNavigator,
  Clips: ClipsNavigator,
  Find: FindNavigator,
  More: MoreNavigator
}, {
    tabBarComponent: (props: any) => <PVTabBar {...props} />,
    tabBarOptions: {
      inactiveTintColor: PV.Colors.grayDark,
      activeTintColor: colors.brandColor
    }
  })

const MainApp = createStackNavigator({
  [PV.RouteNames.TabNavigator]: TabNavigator,
  [PV.RouteNames.AuthNavigator]: AuthNavigator
}, {
    mode: 'modal',
    headerMode: 'none'
  })

const SwitchNavigator = createSwitchNavigator({
  MainApp,
  Onboarding: OnboardingNavigator
}, {
    initialRouteName: PV.RouteNames.MainApp
  })

export default createAppContainer(SwitchNavigator)
