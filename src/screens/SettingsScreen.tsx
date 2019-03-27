import AsyncStorage from '@react-native-community/async-storage'
import { Switch } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
import { core, darkTheme, lightTheme } from '../styles'

export class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings'
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme })
    value ? AsyncStorage.setItem('DARK_MODE_ENABLED', 'TRUE') : AsyncStorage.removeItem('DARK_MODE_ENABLED')
  }

  render() {
    const { globalTheme } = this.global
    return (
      <View style={core.view}>
        <Text style={globalTheme.text}>Settings</Text>
        <Text style={globalTheme.text}>Toggle Dark Mode</Text>
        <Switch value={globalTheme === darkTheme} onValueChange={this._toggleTheme} />
      </View>
    )
  }
}
