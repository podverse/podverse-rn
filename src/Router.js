/**
 * @flow
 */
import { createBottomTabNavigator, createAppContainer, createStackNavigator } from "react-navigation"
import { PodcastsListScreen, DownloadsListScreen, MoreOptionsScreen, SearchPodcastsScreen, ClipsListScreen } from "./components"


const PodcastsNavigator = createStackNavigator({
  Podcasts: PodcastsListScreen
},
{
  defaultNavigationOptions: {
    title: "Podcasts",
    headerStyle: {
      backgroundColor: "#2968b1"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  }
})

const ClipsNavigator = createStackNavigator({
  Clips: ClipsListScreen
},
{
  defaultNavigationOptions: {
    title: "Clips",
    headerStyle: {
      backgroundColor: "#2968b1"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  }
})

const SearchNavigator = createStackNavigator({
  Find: SearchPodcastsScreen
},
{
  defaultNavigationOptions: {
    title: "Find",
    headerStyle: {
      backgroundColor: "#2968b1"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  }
})

const DownloadsNavigator = createStackNavigator({
  Downloads: DownloadsListScreen
},
{
  defaultNavigationOptions: {
    title: "Downloads",
    headerStyle: {
      backgroundColor: "#2968b1"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  }
})

const MoreOptionsNavigator = createStackNavigator({
  More: MoreOptionsScreen
},
{
  defaultNavigationOptions: {
    title: "More",
    headerStyle: {
      backgroundColor: "#2968b1"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold"
    }
  }
})


const AppNavigator = createBottomTabNavigator({
  Podcasts: PodcastsNavigator,
  Clips: ClipsNavigator,
  Find: SearchNavigator,
  Downloads: DownloadsNavigator,
  More: MoreOptionsNavigator
})

export default createAppContainer(AppNavigator)