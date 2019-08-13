import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { SwitchWithText, View } from '../components'
import { PV } from '../resources'
import { darkTheme, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  downloadingWifiOnly?: boolean
  streamingWifiOnly?: boolean
}

export class SettingsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Settings'
  }

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    const streamingWifiOnly = await AsyncStorage.getItem(PV.Keys.STREAMING_WIFI_ONLY)
    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)

    this.setState({
      autoDeleteEpisodeOnEnd: !!autoDeleteEpisodeOnEnd,
      downloadingWifiOnly: !!downloadingWifiOnly,
      streamingWifiOnly: !!streamingWifiOnly
    })
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.DARK_MODE_ENABLED)
    })
  }

  _toggleDownloadingWifiOnly = (value: boolean) => {
    this.setState({ downloadingWifiOnly: value }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    })
  }

  _toggleStreamingWifiOnly = (value: boolean) => {
    this.setState({ streamingWifiOnly: value }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.STREAMING_WIFI_ONLY, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.STREAMING_WIFI_ONLY)
    })
  }

  _toggleAutoDeleteEpisodeOnEnd = (value: boolean) => {
    this.setState({ autoDeleteEpisodeOnEnd: value }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    })
  }

  render() {
    const { autoDeleteEpisodeOnEnd, downloadingWifiOnly } = this.state

    return (
      <View style={styles.wrapper}>
        <SwitchWithText
          onValueChange={this._toggleTheme}
          text={`${this.global.globalTheme === darkTheme ? 'Dark Mode' : 'Light Mode'}`}
          value={this.global.globalTheme === darkTheme} />
        <SwitchWithText
          onValueChange={this._toggleDownloadingWifiOnly}
          text='Only allow downloading when connected to Wifi'
          value={!!downloadingWifiOnly} />
        <SwitchWithText
          onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
          text='Delete downloaded episodes after end is reached'
          value={!!autoDeleteEpisodeOnEnd} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  }
})
