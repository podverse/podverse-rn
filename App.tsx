import 'react-native-gesture-handler'
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo'
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import React, { Component } from 'react'
import { Image, LogBox, Platform, StatusBar, Text, View } from 'react-native'
import Config from 'react-native-config'
import { getFontScale } from 'react-native-device-info'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Orientation from 'react-native-orientation-locker'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { setGlobal } from 'reactn'
import { 
  UpdateRequiredOverlay, 
  OverlayAlert, 
  ImageFullView, 
  BoostDropdownBanner, 
  LoadingInterstitialView,
  TabBarLabel,
  DownloadsActiveBadge
} from './src/components'
import { pvIsTablet } from './src/lib/deviceDetection'
import { refreshDownloads } from './src/lib/downloader'
import { PV } from './src/resources'
import { determineFontScaleMode } from './src/resources/Fonts'
import { GlobalTheme } from './src/resources/Interfaces'
// import Router from './src/Router'
import { AboutScreen, AddPodcastByRSSScreen, AppModeScreen, ClipsScreen, ContactScreen, ContactXMPPChatScreen, ContributeScreen, EpisodesScreen, FAQScreen, MembershipScreen, MoreScreen, MyLibraryScreen, PodcastScreen, PrivacyPolicyScreen, SettingsScreen, SettingsScreenAccount, SettingsScreenAdvanced, SettingsScreenDownloads, SettingsScreenHistory, SettingsScreenOther, SettingsScreenPlayer, SettingsScreenQueue, SettingsScreenTracking, TermsOfServiceScreen, V4VInfoStreamingSatsScreen, V4VProvidersAlbyScreen, V4VProvidersScreen } from './src/screens'
import { isInitialLoadPodcastsScreen, PodcastsScreen } from './src/screens/PodcastsScreen'
import { downloadCategoriesList } from './src/services/category'
import PVEventEmitter from './src/services/eventEmitter'
import { playerHandlePauseWithUpdate } from './src/services/player'
import { isOnMinimumAllowedVersion } from './src/services/versioning'
import { pauseDownloadingEpisodesAll } from './src/state/actions/downloads'
import { settingsRunEveryStartup } from './src/state/actions/settings'
import initialState from './src/state/initialState'
import { darkTheme, lightTheme } from './src/styles'
import { translate } from './src/lib/i18n'
import { hasValidDownloadingConnection } from './src/lib/network'
import {
  handleCarPlayPodcastsUpdate,
  handleCarPlayQueueUpdate,
  registerCarModule,
  showRootView,
  unregisterCarModule
} from './src/lib/carplay/PVCarPlay'

LogBox.ignoreLogs(['EventEmitter.removeListener', "Require cycle"])

type Props = any

type State = {
  appReady: boolean
  minVersionMismatch: boolean
}

setGlobal(initialState)

let ignoreHandleNetworkChange = true
let carplayEventsInitialized = false

const config = {
  screens: {
    [PV.RouteNames.PodcastsScreen]: PV.DeepLinks.Podcasts.path,
    [PV.RouteNames.MembershipScreen]: PV.DeepLinks.Membership.path,
    [PV.RouteNames.ContactScreen]: PV.DeepLinks.Contact.path,
    [PV.RouteNames.ContactXMPPChatScreen]: PV.DeepLinks.XMPP.path,
    [PV.RouteNames.ContributeScreen]: PV.DeepLinks.Contribute.path,
    [PV.RouteNames.AboutScreen]: PV.DeepLinks.About.path,
    [PV.RouteNames.TermsOfServiceScreen]: PV.DeepLinks.Terms.path
  }
}

const linking = {
  // should add 'https://podverse.fm' ?
  prefixes: [PV.DeepLinks.prefix],
  config
}

const setRootStackOptions = (options: StackNavigationOptions = {}): StackNavigationOptions => ({
  headerShown: false,
  ...options
})

const setModalStackOptions = (options: StackNavigationOptions = {}): StackNavigationOptions => ({
  headerShown: false,
  presentation: 'modal',
  ...options
})

const setStackOptions = (options: BottomTabNavigationOptions = {}): BottomTabNavigationOptions => ({
  headerShown: false,
  ...options
})

const defaultHeaderOptions: StackNavigationOptions = {
  headerStyle: { backgroundColor: PV.Colors.ink, shadowColor: 'transparent' },
  headerTintColor: darkTheme.text.color,
  headerTitleStyle: {
    fontWeight: 'bold'
  }
  //   headerRight: () => <NavSearchIcon navigation={navigation} />,
  //   // Prevent white screen flash on navigation on Android
  //   ...(Platform.OS === 'android' ? { animationEnabled: false } : {}),
  //   ...(Platform.OS === 'android' ? { backgroundColor: 'transparent' } : {})
}

const setHeaderOptions = (options: StackNavigationOptions = {}): StackNavigationOptions => ({
  ...defaultHeaderOptions,
  ...options
})

const Tab = createBottomTabNavigator()

const RootStack = createStackNavigator()

const PodcastsStack = createStackNavigator()

function PodcastsStackScreen() {
  return (
    <PodcastsStack.Navigator initialRouteName={PV.RouteNames.PodcastsScreen}>
      <PodcastsStack.Screen
        name={PV.RouteNames.PodcastsScreen}
        component={PodcastsScreen}
        options={setHeaderOptions({})}
      />
      <PodcastsStack.Screen name={PV.RouteNames.PodcastScreen} component={PodcastScreen} />
    </PodcastsStack.Navigator>
  )
}

const EpisodesStack = createStackNavigator()

function EpisodesStackScreen() {
  return (
    <EpisodesStack.Navigator initialRouteName={PV.RouteNames.EpisodesScreen}>
      <EpisodesStack.Screen name={PV.RouteNames.EpisodesScreen} component={EpisodesScreen} options={defaultHeaderOptions} />
    </EpisodesStack.Navigator>
  )
}

const ClipsStack = createStackNavigator()

function ClipsStackScreen() {
  return (
    <ClipsStack.Navigator initialRouteName={PV.RouteNames.ClipsScreen}>
      <ClipsStack.Screen name={PV.RouteNames.ClipsScreen} component={ClipsScreen} options={defaultHeaderOptions} />
    </ClipsStack.Navigator>
  )
}

const MyLibraryStack = createStackNavigator()

function MyLibraryStackScreen() {
  return (
    <MyLibraryStack.Navigator initialRouteName={PV.RouteNames.MyLibraryScreen}>
      <MyLibraryStack.Screen name={PV.RouteNames.MyLibraryScreen} component={MyLibraryScreen} options={defaultHeaderOptions} />
    </MyLibraryStack.Navigator>
  )
}

const MoreStack = createStackNavigator()

function MoreStackScreen() {
  return (
    <MoreStack.Navigator initialRouteName={PV.RouteNames.MoreScreen}>
      <MoreStack.Screen name={PV.RouteNames.MoreScreen} component={MoreScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreen} component={SettingsScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenAccount} component={SettingsScreenAccount} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenAdvanced} component={SettingsScreenAdvanced} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenOther} component={SettingsScreenOther} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenDownloads} component={SettingsScreenDownloads} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenHistory} component={SettingsScreenHistory} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenPlayer} component={SettingsScreenPlayer} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenQueue} component={SettingsScreenQueue} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.SettingsScreenTracking} component={SettingsScreenTracking} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.MembershipScreen} component={MembershipScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.AppModeScreen} component={AppModeScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.ContactScreen} component={ContactScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.ContactXMPPChatScreen} component={ContactXMPPChatScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.ContributeScreen} component={ContributeScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.AboutScreen} component={AboutScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.TermsOfServiceScreen} component={TermsOfServiceScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.PrivacyPolicyScreen} component={PrivacyPolicyScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.FAQScreen} component={FAQScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.V4VProvidersScreen} component={V4VProvidersScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.V4VProvidersAlbyScreen} component={V4VProvidersAlbyScreen} options={defaultHeaderOptions} />
      <MoreStack.Screen name={PV.RouteNames.V4VInfoStreamingSatsScreen} component={V4VInfoStreamingSatsScreen} options={defaultHeaderOptions} />
    </MoreStack.Navigator>
  )
}

const AddPodcastByRSSURLStack = createStackNavigator()

function AddPodcastByRSSURLStackScreen() {
  return (
    <AddPodcastByRSSURLStack.Navigator initialRouteName={PV.RouteNames.AddPodcastByRSSScreen}>
      <AddPodcastByRSSURLStack.Screen name={PV.RouteNames.AddPodcastByRSSScreen} component={AddPodcastByRSSScreen} options={defaultHeaderOptions} />
    </AddPodcastByRSSURLStack.Navigator>
  )
}

function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName={PV.RouteNames.StackPodcasts}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const sources = {
            [PV.RouteNames.StackPodcasts]: PV.Tabs.Podcasts.icon,
            [PV.RouteNames.StackEpisodes]: PV.Tabs.Episodes.icon,
            [PV.RouteNames.StackClips]: PV.Tabs.Clips.icon,
            [PV.RouteNames.StackMyLibrary]: PV.Tabs.MyLibrary.icon,
            [PV.RouteNames.StackMore]: PV.Tabs.More.icon
          }
          const source = sources[route.name]

          if (PV.RouteNames.StackMyLibrary === route.name) {
            return (
              <View>
                <Image source={PV.Tabs.MyLibrary.icon} style={{ tintColor: color }} resizeMode={'contain'} />
                <DownloadsActiveBadge />
              </View>
            )
          } else {
            return <Image source={source} style={{ tintColor: color }} resizeMode={'contain'} />
          }
        },
        tabBarLabel: (props) => {
          const tabKeys = {
            [PV.RouteNames.StackPodcasts]: translate('Podcasts'),
            [PV.RouteNames.StackEpisodes]: translate('Episodes'),
            [PV.RouteNames.StackClips]: translate('Clips'),
            [PV.RouteNames.StackMyLibrary]: translate('My Library'),
            [PV.RouteNames.StackMore]: translate('More')
          }
          const tabKey = tabKeys[route.name]
          return <TabBarLabel {...props} tabKey={tabKey} />
        },
        tabBarActiveTintColor: PV.Colors.skyLight,
        tabBarInactiveTintColor: PV.Colors.white,
        tabBarStyle: darkTheme.tabbar,
        tabBarLabelPosition: 'below-icon'
        // tabBar: (props: any) => <PVTabBar {...props} />
      })}>
      <Tab.Screen
        name={PV.RouteNames.StackPodcasts}
        component={PodcastsStackScreen}
        options={setStackOptions({
          tabBarTestID: 'tab_podcasts_screen'.prependTestId()
        })}
      />
      <Tab.Screen
        name={PV.RouteNames.StackEpisodes}
        component={EpisodesStackScreen}
        options={setStackOptions({
          tabBarTestID: 'tab_episodes_screen'.prependTestId()
        })}
      />
      <Tab.Screen
        name={PV.RouteNames.StackClips}
        component={ClipsStackScreen}
        options={setStackOptions({
          tabBarTestID: 'tab_clips_screen'.prependTestId()
        })}
      />
      <Tab.Screen
        name={PV.RouteNames.StackMyLibrary}
        component={MyLibraryStackScreen}
        options={setStackOptions({
          tabBarTestID: 'tab_my_library_screen'.prependTestId()
        })}
      />
      <Tab.Screen
        name={PV.RouteNames.StackMore}
        component={MoreStackScreen}
        options={setStackOptions({
          tabBarTestID: 'tab_more_screen'.prependTestId()
        })}
      />
    </Tab.Navigator>
  )
}

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super()

    if (!pvIsTablet()) {
      Orientation.lockToPortrait()
    }

    this.state = {
      appReady: false,
      minVersionMismatch: false
    }
    this.unsubscribeNetListener = null
    downloadCategoriesList()
  }

  async componentDidMount() {
    TrackPlayer.registerPlaybackService(() => require('./src/services/playerAudioEvents'))
    
    StatusBar.setBarStyle('light-content')
    Platform.OS === 'android' && StatusBar.setBackgroundColor(PV.Colors.ink, true)
    const darkModeEnabled = await AsyncStorage.getItem(PV.Keys.DARK_MODE_ENABLED)
    let globalTheme = darkTheme
    if (darkModeEnabled === null) {
      globalTheme = Config.DEFAULT_THEME_DARK ? darkTheme : lightTheme
    } else if (darkModeEnabled === 'FALSE') {
      globalTheme = lightTheme
    }

    await this.setupGlobalState(globalTheme)

    await settingsRunEveryStartup()

    this.unsubscribeNetListener = NetInfo.addEventListener(this.handleNetworkChange)

    registerCarModule(this.onConnect, this.onDisconnect)
  }

  componentWillUnmount() {
    this.unsubscribeNetListener && this.unsubscribeNetListener()

    unregisterCarModule(this.onConnect, this.onDisconnect);
  }

  onConnect = () => {
    // Do things now that carplay is connected
    showRootView()
    if (!carplayEventsInitialized) {
      carplayEventsInitialized = true
      PVEventEmitter.on(PV.Events.QUEUE_HAS_UPDATED, handleCarPlayQueueUpdate)
      PVEventEmitter.on(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, handleCarPlayPodcastsUpdate)

      /*
        This code is intended to correct a race condition when the mobile app is already initialized,
        then CarPlay is connected later.
      */
      if (!isInitialLoadPodcastsScreen) {
        handleCarPlayPodcastsUpdate()
      }
    }
  }

  onDisconnect = () => {
    playerHandlePauseWithUpdate()

    // Do things now that carplay is disconnected
    PVEventEmitter.removeListener(PV.Events.QUEUE_HAS_UPDATED, handleCarPlayQueueUpdate)
    PVEventEmitter.removeListener(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, handleCarPlayPodcastsUpdate)
  }

  handleNetworkChange = () => {
    (async () => {
      // isInternetReachable will be false

      await this.checkAppVersion()
      this.setState({ appReady: true })
      // Don't continue handleNetworkChange when internet is first reachable on initial app launch
      if (ignoreHandleNetworkChange) {
        ignoreHandleNetworkChange = false
        return
      }
      const skipCannotDownloadAlert = true
      if (await hasValidDownloadingConnection(skipCannotDownloadAlert)) {
        refreshDownloads()
      } else {
        pauseDownloadingEpisodesAll()
      }
    })()
  }

  setupGlobalState = async (theme: GlobalTheme) => {
    const fontScale = await getFontScale()
    const appMode = await AsyncStorage.getItem(PV.Keys.APP_MODE)
    const fontScaleMode = determineFontScaleMode(fontScale)

    setGlobal(
      {
        globalTheme: theme,
        fontScaleMode,
        fontScale,
        appMode: appMode || PV.AppMode.podcasts
      }
    )
  }

  checkAppVersion = async () => {
    const versionValid = await isOnMinimumAllowedVersion()
    this.setState({ minVersionMismatch: !versionValid })
  }

  _renderIntersitial = () => {
    if (Platform.OS === 'ios') {
      return null
    }

    return (
      <View style={{ backgroundColor: PV.Colors.ink, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={PV.Images.BANNER} resizeMode='contain' />
      </View>
    )
  }

  render() {
    // Prevent white screen flash on navigation on Android
    const wrapperStyle =
      Platform.OS === 'android'
        ? {
            backgroundColor: PV.Colors.ink,
            borderColor: PV.Colors.ink,
            shadowOpacity: 1,
            opacity: 1
          }
        : {
          flex: 1
        }

    if (this.state.minVersionMismatch) {
      return <UpdateRequiredOverlay />
    }

    const appComponent = this.state.appReady ? (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics} style={wrapperStyle}>
          <View style={{ flex: 1 }}>
            {/* <Router /> */}
            <NavigationContainer linking={linking}>
              <RootStack.Navigator>
                <RootStack.Screen name={PV.RouteNames.RootTabs} component={HomeTabs} options={setRootStackOptions()} />
                <RootStack.Screen
                  name={PV.RouteNames.RootAddPodcastByRSSURLStack}
                  component={AddPodcastByRSSURLStackScreen}
                  options={setModalStackOptions()}
                />
              </RootStack.Navigator>
            </NavigationContainer>
            <OverlayAlert />
          </View>
          <ImageFullView />
          <BoostDropdownBanner />
        </SafeAreaProvider>
        <LoadingInterstitialView />
      </GestureHandlerRootView>
    ) : (
      this._renderIntersitial()
    )

    return appComponent
  }
}

export default App
