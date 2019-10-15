import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import { Icon, SwitchWithText, Text, View } from '../components'
import { refreshDownloads } from '../lib/downloader'
import { PV } from '../resources'
import { darkTheme, hidePickerIconOnAndroidTransparent, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  downloadingWifiOnly?: boolean
  maximumSpeedOptionSelected?: any
}

export class SettingsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Settings'
  }

  constructor(props: Props) {
    super(props)
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    this.state = {
      maximumSpeedOptionSelected: maximumSpeedSelectOptions[1]
    }
  }

  async componentDidMount() {
    const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    const maximumSpeed = await AsyncStorage.getItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === Number(maximumSpeed))

    this.setState({
      autoDeleteEpisodeOnEnd: !!autoDeleteEpisodeOnEnd,
      downloadingWifiOnly: !!downloadingWifiOnly,
      maximumSpeedOptionSelected: maximumSpeedOptionSelected || maximumSpeedSelectOptions[1]
    })
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'TRUE')
        : await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'FALSE')
    })
  }

  _toggleDownloadingWifiOnly = (value: boolean) => {

    NetInfo.fetch().then((state) => {
      if (!value && state.type === 'cellular') {
        refreshDownloads()
      }
    })

    this.setState({ downloadingWifiOnly: value }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    })
  }

  _toggleAutoDeleteEpisodeOnEnd = (value: boolean) => {
    this.setState({ autoDeleteEpisodeOnEnd: value }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    })
  }

  _setMaximumSpeed = (value: string) => {
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === value) || placeholderItem
    this.setState({ maximumSpeedOptionSelected }, async () => {
      value ? await AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, value)
        : await AsyncStorage.removeItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
    })
  }

  render() {
    const { downloadingWifiOnly, maximumSpeedOptionSelected } = this.state
    const { globalTheme } = this.global
    const isDarkMode = globalTheme === darkTheme

    return (
      <View style={styles.wrapper}>
        <SwitchWithText
          onValueChange={this._toggleTheme}
          text={`${globalTheme === darkTheme ? 'Dark Mode' : 'Light Mode'}`}
          value={globalTheme === darkTheme} />
        <SwitchWithText
          onValueChange={this._toggleDownloadingWifiOnly}
          text='Only allow downloading when connected to Wifi'
          value={!!downloadingWifiOnly} />
        {/* <SwitchWithText
          onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
          text='Delete downloaded episodes after end is reached'
          value={!!autoDeleteEpisodeOnEnd} /> */}
        <RNPickerSelect
          items={PV.Player.maximumSpeedSelectOptions}
          onValueChange={this._setMaximumSpeed}
          placeholder={placeholderItem}
          style={hidePickerIconOnAndroidTransparent(isDarkMode)}
          useNativeAndroidPickerStyle={false}
          value={maximumSpeedOptionSelected.value}>
          <View style={styles.selectorWrapper}>
            <View style={styles.selectorWrapperLeft}>
              <Text style={[styles.pickerSelect, globalTheme.text]}>
                {maximumSpeedOptionSelected.label}
              </Text>
              <Icon
                name='angle-down'
                size={14}
                style={[styles.pickerSelectIcon, globalTheme.text]} />
            </View>
            <View style={styles.selectorWrapperRight}>
              <Text style={[styles.pickerSelect, globalTheme.text]}>
                Maximum playback speed
              </Text>
            </View>
          </View>
        </RNPickerSelect>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  pickerSelect: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    height: 48,
    lineHeight: 40,
    paddingBottom: 8
  },
  pickerSelectIcon: {
    height: 48,
    lineHeight: 40,
    paddingBottom: 8,
    paddingHorizontal: 4
  },
  selectorWrapper: {
    flexDirection: 'row'
  },
  selectorWrapperLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    width: 51
  },
  selectorWrapperRight: {
    flexBasis: 'auto',
    justifyContent: 'flex-start',
    marginHorizontal: 12
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  }
})

const placeholderItem = {
  label: 'Select...',
  value: null
}
