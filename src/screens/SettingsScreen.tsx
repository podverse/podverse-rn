import AsyncStorage from '@react-native-community/async-storage';
import { StyleSheet, Switch } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
import { darkTheme, lightTheme } from '../styles'

export class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings'
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme })
    value ? AsyncStorage.setItem('DARK_MODE_ENABLED', 'TRUE') : AsyncStorage.removeItem('DARK_MODE_ENABLED')
  }

  render() {
    return (
      <View style={styles.view}>
        <Text>Settings</Text>
        <Text>Toggle Dark Mode</Text>
        <Switch value={this.global.globalTheme === darkTheme} onValueChange={this._toggleTheme} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
