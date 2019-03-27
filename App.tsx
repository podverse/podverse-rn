import AsyncStorage from '@react-native-community/async-storage'
import React, { Component } from 'react'
import { Image, StatusBar, View } from 'react-native'
import { Provider } from 'react-redux'
import { setGlobal } from 'reactn'
import { PV } from './src/resources'
import Router from './src/Router'
import { configureStore } from './src/store/store'
import { darkTheme, lightTheme } from './src/styles'

type Props = {}

type State = {
  appReady: boolean
}

interface App {
  store?: any
}

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
    this.setupGlobalState(darkModeEnabled ? darkTheme : lightTheme)
    this.setState({ appReady: true })
  }

  setupGlobalState(theme: {}) {
    setGlobal({
      globalTheme: theme
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
