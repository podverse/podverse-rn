/**
 * @flow
 */
import { createAppContainer, createStackNavigator, createSwitchNavigator } from "react-navigation"
import { createBottomTabNavigator } from "react-navigation-tabs"
import { SubcribedPodcastsScreen, DownloadsListScreen, MoreOptionsScreen, SearchPodcastsScreen, ClipsListScreen, OnBoardingScreen, AuthScreen } from "./screens"
import {PVTabBar} from "./components"
import { PV } from "./resources"
import React from "react"
import { Image } from "react-native"


const PodcastsNavigator = createStackNavigator({
  [PV.ScreenNames.SubscribedPodcastsScreen]: SubcribedPodcastsScreen
},
{
  defaultNavigationOptions: {
    title: PV.Tabs.Podcasts.title,
    headerStyle: {
      backgroundColor: PV.Colors.podverseBlue
    },
    headerTintColor: PV.Colors.white,
    headerTitleStyle: {
      fontWeight: "bold"
    }
  },
  navigationOptions: {
    tabBarIcon: ({tintColor}) => <Image source={PV.Tabs.Podcasts.icon} height={25} width={25} style={{tintColor}} resizeMode="contain"/>
  }
})

const ClipsNavigator = createStackNavigator({
  [PV.ScreenNames.ClipsListScreen]: ClipsListScreen
},
{
  defaultNavigationOptions: {
    title: PV.Tabs.Clips.title,
    headerStyle: {
      backgroundColor: PV.Colors.podverseBlue
    },
    headerTintColor: PV.Colors.white,
    headerTitleStyle: {
      fontWeight: "bold"
    }
  },
  navigationOptions: {
    tabBarIcon: ({tintColor}) => <Image source={PV.Tabs.Clips.icon} height={25} width={25} style={{tintColor}} resizeMode="contain"/>
  }
})

const SearchNavigator = createStackNavigator({
  [PV.ScreenNames.SearchPodcastsScreen]: SearchPodcastsScreen
},
{
  defaultNavigationOptions: {
    title: PV.Tabs.Find.title,
    headerStyle: {
      backgroundColor: PV.Colors.podverseBlue
    },
    headerTintColor: PV.Colors.white,
    headerTitleStyle: {
      fontWeight: "bold"
    }
  },
  navigationOptions: {
    tabBarIcon: ({tintColor}) => <Image source={PV.Tabs.Find.icon} height={25} width={25} style={{tintColor}} resizeMode="contain"/>
  }
})

const DownloadsNavigator = createStackNavigator({
  [PV.ScreenNames.DownloadsListScreen]: DownloadsListScreen
},
{
  defaultNavigationOptions: {
    title: PV.Tabs.Downloads.title,
    headerStyle: {
      backgroundColor: PV.Colors.podverseBlue
    },
    headerTintColor: PV.Colors.white,
    headerTitleStyle: {
      fontWeight: "bold"
    }
  },
  navigationOptions: {
    tabBarIcon: ({tintColor}) => <Image source={PV.Tabs.Downloads.icon} height={25} width={25} style={{tintColor}} resizeMode="contain"/>
  }
})

const MoreOptionsNavigator = createStackNavigator({
  [PV.ScreenNames.MoreOptionsScreen]: MoreOptionsScreen
},
{
  defaultNavigationOptions: {
    title: PV.Tabs.More.title,
    headerStyle: {
      backgroundColor: PV.Colors.podverseBlue
    },
    headerTintColor: PV.Colors.white,
    headerTitleStyle: {
      fontWeight: "bold"
    }
  },
  navigationOptions: {
    tabBarIcon: ({tintColor}) => <Image source={PV.Tabs.More.icon} height={25} width={25} style={{tintColor}} resizeMode="contain"/>
  }
})

const OnBoardingNavigator = createStackNavigator({
  [PV.ScreenNames.OnboardingScreen]: OnBoardingScreen,
  [PV.ScreenNames.AuthScreen]: AuthScreen
}, {
  mode: "modal",
  headerMode: "none"
})

const TabNavigator = createBottomTabNavigator({
  Podcasts: PodcastsNavigator,
  Clips: ClipsNavigator,
  Find: SearchNavigator,
  Downloads: DownloadsNavigator,
  More: MoreOptionsNavigator
}, {
  tabBarComponent: (props) => <PVTabBar {...props}/>,
  tabBarOptions: {
    inactiveTintColor: "black",
    activeTintColor: PV.Colors.podverseBlue
  }
})

const SwitchNavigator = createSwitchNavigator({
  MainApp: TabNavigator,
  OnBoarding: OnBoardingNavigator
}, {
  initialRouteName: "MainApp"
})

export default createAppContainer(SwitchNavigator)