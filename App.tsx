import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo'
import React, { Component } from 'react'
import { Image, Platform, StatusBar, View, YellowBox } from 'react-native'
import 'react-native-gesture-handler'
import TrackPlayer from 'react-native-track-player'
import { setGlobal } from 'reactn'
import { refreshDownloads } from './src/lib/downloader'
import { PV } from './src/resources'
import { GlobalTheme } from './src/resources/Interfaces'
import Router from './src/Router'
import initialState from './src/state/initialState'
import { darkTheme, lightTheme } from './src/styles'

YellowBox.ignoreWarnings(['Warning: componentWillUpdate'])

type Props = {}

type State = {
  appReady: boolean
}

setGlobal(initialState)

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super(props)
    StatusBar.setBarStyle('light-content')
    Platform.OS === 'android' && StatusBar.setBackgroundColor(PV.Colors.brandColor)
    this.state = {
      appReady: false
    }
    this.unsubscribeNetListener = null
  }

  async componentDidMount() {
    TrackPlayer.registerPlaybackService(() => require('./src/services/playerEvents'))
    const darkModeEnabled = await AsyncStorage.getItem(PV.Keys.DARK_MODE_ENABLED)
    this.setupGlobalState(darkModeEnabled === 'TRUE' || darkModeEnabled === null ? darkTheme : lightTheme)
    this.unsubscribeNetListener = NetInfo.addEventListener(this.handleNetworkChange)
  }

  componentWillUnmount() {
    this.unsubscribeNetListener && this.unsubscribeNetListener()
  }

  handleNetworkChange = async (state: NetInfoState) => {
    if (state.type === 'wifi') {
      refreshDownloads()
    } else if (state.type === 'cellular') {
      const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
      if (!downloadingWifiOnly) refreshDownloads()
    }
  }

  setupGlobalState(theme: GlobalTheme) {
    setGlobal({
      globalTheme: theme
    }, () => {
      this.setState({ appReady: true })
    })
  }

  _renderIntersitial = () => {
    return (
      <View style={{ backgroundColor: PV.Colors.brandColor, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={PV.Images.BANNER} resizeMode='contain' />
      </View>
    )
  }

  render() {
    return this.state.appReady ? <Router /> : this._renderIntersitial()
  }
}

export default App
