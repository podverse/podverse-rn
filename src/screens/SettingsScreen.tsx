import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { SwitchWithText, View } from '../components'
import { PV } from '../resources'
import { darkTheme, lightTheme } from '../styles'

type Props = {}

type State = {
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

    this.setState({
      downloadingWifiOnly: !!downloadingWifiOnly,
      streamingWifiOnly: !!streamingWifiOnly
    })
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme }, () => {
      value ? AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'TRUE') : AsyncStorage.removeItem(PV.Keys.DARK_MODE_ENABLED)
    })
  }

  _toggleDownloadingWifiOnly = (value: boolean) => {
    this.setState({ downloadingWifiOnly: value }, () => {
      value ? AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE') : AsyncStorage.removeItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    })
  }

  _toggleStreamingWifiOnly = (value: boolean) => {
    this.setState({ streamingWifiOnly: value }, () => {
      value ? AsyncStorage.setItem(PV.Keys.STREAMING_WIFI_ONLY, 'TRUE') : AsyncStorage.removeItem(PV.Keys.STREAMING_WIFI_ONLY)
    })
  }

  render() {
    const { downloadingWifiOnly, streamingWifiOnly } = this.state

    return (
      <View style={styles.wrapper}>
        <SwitchWithText
          onValueChange={this._toggleTheme}
          text={`Dark Mode ${this.global.globalTheme === darkTheme ? 'on' : 'off'}`}
          value={this.global.globalTheme === darkTheme} />
        <SwitchWithText
          onValueChange={this._toggleDownloadingWifiOnly}
          text='Only allow downloading when connected to Wifi'
          value={!!downloadingWifiOnly} />
        <SwitchWithText
          onValueChange={this._toggleStreamingWifiOnly}
          text='Only allow streaming when connected to Wifi'
          value={!!streamingWifiOnly} />
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
