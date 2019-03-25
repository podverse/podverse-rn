import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, View } from '../components'
import { PV } from '../resources'
import { table } from '../styles'

type Props = {}

type State = {
  options: any[]
}

const moreFeaturesOptions = [
  {
    title: 'Downloads',
    key: PV.RouteNames.DownloadsScreen
  },
  {
    title: 'Playlists',
    key: PV.RouteNames.PlaylistsScreen
  },
  {
    title: 'Profiles',
    key: PV.RouteNames.ProfilesScreen
  },
  {
    title: 'My Profile',
    key: PV.RouteNames.MyProfileScreen
  },
  {
    title: 'Settings',
    key: PV.RouteNames.SettingsScreen
  },
  {
    title: 'Log out',
    key: 'logOut'
  }
]

const moreOtherOptions = [
  {
    title: 'Feedback',
    key: 'feedback'
  },
  {
    title: 'About',
    key: 'about'
  }
]

export class MoreScreen extends React.Component<Props, State> {
  state = {
    options: []
  }

  _onPress = (item: any) => {
    console.log('hello world', item)
    if (item.title === 'Settings') {
      this.props.navigation.navigate(PV.RouteNames.SettingsScreen)
    }
  }

  render() {
    return (
      <View style={styles.view}>
        <FlatList
          data={moreFeaturesOptions}
          renderItem={({ item, separators }) => (
            <TouchableOpacity
              onPress={() => this._onPress(item)}
              style={table.cellWrapper}>
              <Text style={table.cellText}>{item.title}</Text>
            </TouchableOpacity>
          )} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    padding: 10
  }
})
