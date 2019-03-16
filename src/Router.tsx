import React from 'react'
import { Image } from 'react-native'
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { PVTabBar } from './components'
import { PV } from './resources'
import {
  AuthScreen, ClipsListScreen, DownloadsListScreen, MoreOptionsScreen,
  OnBoardingScreen, SearchPodcastsScreen, SubcribedPodcastsScreen
} from './screens'

const AuthNavigator = createStackNavigator(
  {
    [PV.RouteNames.AuthScreen]: AuthScreen
  }, {
    headerMode: 'none'
  }
)

const PodcastsNavigator = createStackNavigator(
  {
    [PV.RouteNames.SubscribedPodcastsScreen]: SubcribedPodcastsScreen
  },
  {
    initialRouteName: PV.RouteNames.SubscribedPodcastsScreen,
    defaultNavigationOptions: {
      title: PV.Tabs.Podcasts.title,
      headerStyle: {
        backgroundColor: PV.Colors.podverseBlue
      },
      headerTintColor: PV.Colors.white,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    },
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

const ClipsNavigator = createStackNavigator(
  {
    [PV.RouteNames.ClipsListScreen]: ClipsListScreen
  },
  {
    defaultNavigationOptions: {
      title: PV.Tabs.Clips.title,
      headerStyle: {
        backgroundColor: PV.Colors.podverseBlue
      },
      headerTintColor: PV.Colors.white,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    },
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
    [PV.RouteNames.SearchPodcastsScreen]: SearchPodcastsScreen
  },
  {
    defaultNavigationOptions: {
      title: PV.Tabs.Find.title,
      headerStyle: {
        backgroundColor: PV.Colors.podverseBlue
      },
      headerTintColor: PV.Colors.white,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    },
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

const DownloadsNavigator = createStackNavigator(
  {
    [PV.RouteNames.DownloadsListScreen]: DownloadsListScreen
  },
  {
    defaultNavigationOptions: {
      title: PV.Tabs.Downloads.title,
      headerStyle: {
        backgroundColor: PV.Colors.podverseBlue
      },
      headerTintColor: PV.Colors.white,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    },
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={PV.Tabs.Downloads.icon}
          height={25}
          width={25}
          style={{ tintColor }}
          resizeMode='contain' />
      )
    }
  }
)

const MoreOptionsNavigator = createStackNavigator(
  {
    [PV.RouteNames.MoreOptionsScreen]: MoreOptionsScreen
  },
  {
    defaultNavigationOptions: {
      title: PV.Tabs.More.title,
      headerStyle: {
        backgroundColor: PV.Colors.podverseBlue
      },
      headerTintColor: PV.Colors.white,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    },
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

const OnBoardingNavigator = createStackNavigator({
  [PV.RouteNames.OnboardingScreen]: OnBoardingScreen,
  [PV.RouteNames.AuthNavigator]: AuthNavigator
}, {
    initialRouteName: PV.RouteNames.OnboardingScreen,
    mode: 'modal',
    headerMode: 'none'
  })

const TabNavigator = createBottomTabNavigator({
  Podcasts: PodcastsNavigator,
  Clips: ClipsNavigator,
  Find: SearchNavigator,
  Downloads: DownloadsNavigator,
  More: MoreOptionsNavigator
}, {
    tabBarComponent: (props: any) => <PVTabBar {...props} />,
    tabBarOptions: {
      inactiveTintColor: 'black',
      activeTintColor: PV.Colors.podverseBlue
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
  OnBoarding: OnBoardingNavigator
}, {
    initialRouteName: PV.RouteNames.MainApp
  })

export default createAppContainer(SwitchNavigator)
