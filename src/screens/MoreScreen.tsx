import { FlatList, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

const logoutKey = 'logout'

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
    key: logoutKey
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
  static navigationOptions = {
    title: 'More'
  }

  state = {
    options: []
  }

  _onPress = (item: any) => {
    console.log(item)
    if (item.key === logoutKey) {
      console.log('log out')
    } else {
      this.props.navigation.navigate(item.key)
    }
  }

  render() {
    const { globalTheme } = this.global

    return (
      <View style={core.backgroundView}>
        <FlatList
          data={moreFeaturesOptions}
          renderItem={({ item, separators }) => (
            <TouchableOpacity
              onPress={() => this._onPress(item)}
              style={table.cellWrapper}>
              <Text style={globalTheme.tableCellTextPrimary}>{item.title}</Text>
            </TouchableOpacity>
          )} />
      </View>
    )
  }
}
