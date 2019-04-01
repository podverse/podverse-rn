import { SectionList, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { logoutUser } from '../state/actions/auth'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

const _aboutKey = 'about'
const _feedbackKey = 'feedback'
const _logoutKey = 'logout'
const _loginKey = 'login'

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
    key: _logoutKey
  },
  ,
  {
    title: 'Log In',
    key: _loginKey
  }
]

const moreOtherOptions = [
  {
    title: 'Feedback',
    key: _feedbackKey
  },
  {
    title: 'About',
    key: _aboutKey
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
    if (item.key === _aboutKey) {
      console.log('about')
    } else if (item.key === _feedbackKey) {
      console.log('feedback')
    } else if (item.key === _logoutKey) {
      logoutUser()
    } else if (item.key === _loginKey) {
      this.props.navigation.navigate(PV.RouteNames.AuthNavigator)
    } else {
      this.props.navigation.navigate(item.key)
    }
  }

  render() {

    const { globalTheme, session } = this.global
    const { isLoggedIn = false } = session

    const featureOptions = moreFeaturesOptions.filter((item = { key: '', title: '' }) => {
      if (isLoggedIn) {
        return item.key !== _loginKey
      } else {
        return item.key !== _logoutKey
      }
    })

    return (
      <View style={core.backgroundView}>
        <SectionList
          renderItem={({ item, separators }) => (
            <TouchableOpacity
              onPress={() => this._onPress(item)}
              style={table.cellWrapper}>
              <Text style={globalTheme.tableCellTextPrimary}>{item.title}</Text>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={globalTheme.tableSectionHeaderText}>{title}</Text>
          )}
          sections={[
            { title: 'Features', data: featureOptions },
            { title: 'Other', data: moreOtherOptions }
          ]} />
      </View>
    )
  }
}
