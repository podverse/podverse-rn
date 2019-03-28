import AsyncStorage from '@react-native-community/async-storage'
import React, { Component } from 'react'
import { Image, StatusBar, View } from 'react-native'
import { Provider } from 'react-redux'
import { setGlobal } from 'reactn'
import { PV } from './src/resources'
import Router from './src/Router'
import initialState from './src/store/initialState'
import { configureStore } from './src/store/store'
import { darkTheme, lightTheme } from './src/styles'
type Props = {}

type State = {
  appReady: boolean
}

interface App {
  store?: any
}

setGlobal(initialState)

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.store = configureStore()
    StatusBar.setBarStyle('light-content')
    this.state = {
      appReady: false
    }
  }

  async componentDidMount() {
    const darkModeEnabled = await AsyncStorage.getItem('DARK_MODE_ENABLED')
    this.setupGlobalTheme(darkModeEnabled ? darkTheme : lightTheme)
  }

  setupGlobalTheme(theme: {}) {
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
    return (
      <Provider store={this.store}>
        {this.state.appReady ? <Router /> : this._renderIntersitial()}
      </Provider>
    )
  }
}

export default App
