import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { SwitchWithText, View } from '../components'
import { darkTheme, lightTheme } from '../styles'

export class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings'
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme })
    value ? AsyncStorage.setItem('DARK_MODE_ENABLED', 'TRUE') : AsyncStorage.removeItem('DARK_MODE_ENABLED')
  }

  _toggleNSFWMode = (value: boolean) => {
    this.setGlobal({ settings: { nsfwMode: value } })
    value ? AsyncStorage.setItem('NSFW_MODE_ENABLED', 'TRUE') : AsyncStorage.removeItem('NSFW_MODE_ENABLED')
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <SwitchWithText
          onValueChange={this._toggleTheme}
          text={`Dark Mode ${this.global.globalTheme === darkTheme ? 'on' : 'off'}`}
          value={this.global.globalTheme === darkTheme} />
        {/* <SwitchWithText
          onValueChange={this._toggleNSFWMode}
          text={`NSFW Mode ${this.global.nsfwMode === 'on' ? 'on' : 'off'}`}
          value={this.global.nsfwMode === 'on'} /> */}
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
