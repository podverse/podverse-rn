import { SectionList, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { Divider, TableSectionHeader, Text, View } from '../components'
import { getMembershipStatus } from '../lib/utility'
import { PV } from '../resources'
import { logoutUser } from '../state/actions/auth'
import { core, getMembershipTextStyle, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

export class MoreScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'More'
  }

  state = {
    options: []
  }

  _onPress = (item: any) => {
    const { navigation } = this.props
    if (item.key === _membershipKey) {
      navigation.navigate(PV.RouteNames.MembershipScreen)
    } else if (item.key === _aboutKey) {
      navigation.navigate(PV.RouteNames.AboutScreen)
    } else if (item.key === _feedbackKey) {
      navigation.navigate(PV.RouteNames.FeedbackScreen)
    } else if (item.key === _logoutKey) {
      logoutUser()
    } else if (item.key === _loginKey) {
      navigation.navigate(PV.RouteNames.AuthNavigator)
    } else if (item.key === PV.RouteNames.MyProfileScreen) {
      const user = this.global.session.userInfo
      navigation.navigate(
        PV.RouteNames.ProfileScreen, {
          user,
          navigationTitle: 'My Profile'
        }
      )
    } else {
      navigation.navigate(item.key)
    }
  }

  render() {
    const { globalTheme, session } = this.global
    const { isLoggedIn = false, userInfo } = session
    const options = moreFeaturesOptions(isLoggedIn)

    const featureOptions = options.filter((item = { key: '', title: '' }) => {
      if (isLoggedIn) {
        return item.key !== _loginKey
      } else {
        return item.key !== _logoutKey
      }
    })

    const membershipStatus = getMembershipStatus(userInfo) || 'Membership'
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const otherOptions = moreOtherOptions(membershipStatus)

    return (
      <View style={core.backgroundView}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => this._onPress(item)}>
              {
                item.key !== _membershipKey ?
                  <Text style={[table.cellText, globalTheme.tableCellTextPrimary]}>{item.title}</Text> :
                  <RNView style={[core.row]}>
                    {
                      isLoggedIn ?
                        <Text style={[table.cellText, membershipTextStyle]}>{membershipStatus}</Text> :
                        <Text style={[table.cellText, globalTheme.tableCellTextPrimary]}>Membership</Text>
                    }
                  </RNView>
              }
            </TouchableWithoutFeedback>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <TableSectionHeader title={title} />
          )}
          sections={[
            { title: 'Features', data: featureOptions },
            { title: 'Other', data: otherOptions }
          ]} />
      </View>
    )
  }
}

const _aboutKey = 'about'
const _feedbackKey = 'feedback'
const _membershipKey = 'membership'
const _logoutKey = 'logout'
const _loginKey = 'login'

const moreFeaturesOptions = (isLoggedIn?: boolean) => {
  const items = [
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
    {
      title: 'Log In',
      key: _loginKey
    }
  ]

  return items
}

const moreOtherOptions = (membershipStatus?: string) => {
  const options = [
    {
      title: membershipStatus,
      key: _membershipKey
    },
    {
      title: 'Feedback',
      key: _feedbackKey
    },
    {
      title: 'About',
      key: _aboutKey
    }
  ]

  return options
}
