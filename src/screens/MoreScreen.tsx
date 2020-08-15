import { Linking, SectionList, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { Badge } from 'react-native-elements'
import React from 'reactn'
import { Divider, TableSectionHeader, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl, getMembershipStatus, testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { logoutUser } from '../state/actions/auth'
import { core, getMembershipTextStyle, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

export class MoreScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('More')
    }
  }

  state = {
    options: []
  }

  componentDidMount() {
    gaTrackPageView('/more', 'More Screen')
  }

  _onPress = (item: any) => {
    const { navigation } = this.props
    if (item.key === _membershipKey) {
      navigation.navigate(PV.RouteNames.MembershipScreen)
    } else if (item.key === _aboutKey) {
      navigation.navigate(PV.RouteNames.AboutScreen)
    } else if (item.key === _faqKey) {
      navigation.navigate(PV.RouteNames.FAQScreen)
    } else if (item.key === _contactKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.CONTACT_US))
    } else if (item.key === _termsKey) {
      navigation.navigate(PV.RouteNames.TermsOfServiceScreen)
    } else if (item.key === _logoutKey) {
      logoutUser()
    } else if (item.key === _loginKey) {
      navigation.navigate(PV.RouteNames.AuthNavigator)
    } else if (item.key === PV.RouteNames.MyProfileScreen) {
      const user = this.global.session.userInfo
      navigation.navigate(PV.RouteNames.ProfileScreen, {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true
      })
    } else if (item.key === PV.RouteNames.MyProfileClipsScreen) {
      const user = this.global.session.userInfo
      navigation.navigate(PV.RouteNames.ProfileScreen, {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true,
        initializeClips: true
      })
    } else {
      navigation.navigate(item.key)
    }
  }

  render() {
    const { downloadsActive, fontScaleMode, globalTheme, session } = this.global
    const { isLoggedIn = false, userInfo } = session
    const options = moreFeaturesOptions()

    let downloadsActiveCount = 0
    for (const id of Object.keys(downloadsActive)) {
      if (downloadsActive[id]) downloadsActiveCount++
    }

    const featureOptions = options.filter((item = { key: '', title: '' }) => {
      if (isLoggedIn) {
        return item.key !== _loginKey
      } else {
        return item.key !== _logoutKey
      }
    })

    const membershipStatus = getMembershipStatus(userInfo) || translate('Membership')
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const otherOptions = moreOtherOptions(membershipStatus)

    return (
      <View style={core.backgroundView} {...testProps('more_screen_view')}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => this._onPress(item)} {...testProps(item.testId)}>
              <RNView style={[core.row, table.cellWrapper]}>
                {item.key === _membershipKey && (
                  <RNView style={[core.row, table.cellWrapper]}>
                    {isLoggedIn ? (
                      <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[table.cellText, membershipTextStyle]}>
                        {membershipStatus}
                      </Text>
                    ) : (
                      <Text
                        fontSizeLargestScale={PV.Fonts.largeSizes.md}
                        style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                        {translate('Membership')}
                      </Text>
                    )}
                  </RNView>
                )}
                {item.key === PV.RouteNames.DownloadsScreen && (
                  <RNView style={[core.row, { position: 'relative' }, table.cellWrapper]}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={table.cellText}>
                      Downloads
                    </Text>
                    {downloadsActiveCount > 0 &&
                      fontScaleMode !== PV.Fonts.fontScale.larger &&
                      fontScaleMode !== PV.Fonts.fontScale.largest && (
                        <Badge
                          containerStyle={{
                            position: 'absolute',
                            right: -22,
                            top: 19
                          }}
                          status='error'
                          value={downloadsActiveCount}
                        />
                      )}
                  </RNView>
                )}
                {item.key !== _membershipKey && item.key !== PV.RouteNames.DownloadsScreen && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                    {item.title}
                  </Text>
                )}
              </RNView>
            </TouchableWithoutFeedback>
          )}
          renderSectionHeader={({ section: { title } }) => <TableSectionHeader title={title} />}
          sections={[
            { title: translate('Features'), data: featureOptions },
            { title: translate('Other'), data: otherOptions }
          ]}
        />
      </View>
    )
  }
}

const _aboutKey = 'about'
const _contactKey = 'contact'
const _faqKey = 'faq'
const _membershipKey = 'membership'
const _termsKey = 'terms'
const _logoutKey = 'logout'
const _loginKey = 'login'

const moreFeaturesOptions = () => {
  const items = [
    {
      title: translate('Downloads'),
      key: PV.RouteNames.DownloadsScreen,
      testId: 'more_screen_downloads_cell'
    },
    {
      title: translate('Playlists'),
      key: PV.RouteNames.PlaylistsScreen,
      testId: 'more_screen_playlists_cell'
    },
    {
      title: translate('Profiles'),
      key: PV.RouteNames.ProfilesScreen,
      testId: 'more_screen_profiles_cell'
    },
    {
      title: translate('My Profile'),
      key: PV.RouteNames.MyProfileScreen,
      testId: 'more_screen_my_profile_cell'
    },
    {
      title: translate('My Clips'),
      key: PV.RouteNames.MyProfileClipsScreen,
      testId: 'more_screen_my_clips_cell'
    },
    {
      title: translate('Log out'),
      key: _logoutKey,
      testId: 'more_screen_log_out_cell'
    },
    {
      title: translate('Login'),
      key: _loginKey,
      testId: 'more_screen_login_cell'
    },
    {
      title: translate('Settings'),
      key: PV.RouteNames.SettingsScreen,
      testId: 'more_screen_settings_cell'
    }
  ]

  return items
}

const moreOtherOptions = (membershipStatus?: string) => {
  const options = [
    {
      title: membershipStatus,
      key: _membershipKey,
      testId: 'more_screen_membership_cell'
    },
    {
      title: translate('Add Podcast by RSS'),
      key: PV.RouteNames.AddPodcastByRSSScreen,
      testId: 'more_screen_add_podcast_by_rss_cell'
    },
    {
      title: translate('Contact Us'),
      key: _contactKey,
      testId: 'more_screen_contact_us_cell'
    },
    {
      title: translate('FAQ'),
      key: _faqKey,
      testId: 'more_screen_faq_cell'
    },
    {
      title: translate('About'),
      key: _aboutKey,
      testId: 'more_screen_about_cell'
    },
    {
      title: translate('Terms of Service'),
      key: _termsKey,
      testId: 'more_screen_terms_of_service_cell'
    }
  ]

  return options
}
