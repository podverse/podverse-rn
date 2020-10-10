import { Linking, SectionList, TouchableWithoutFeedback, View as RNView } from 'react-native'
import Config from 'react-native-config'
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

  _moreFeaturesOptions = (isLoggedIn: boolean) => {
    const moreFeaturesList = Config.NAV_STACK_MORE_FEATURES.split(',')
    const loggedInFeatures = [_playlistsKey, _profilesKey, _myProfileKey, _logoutKey]

    return allMoreFeatures
      .filter((item: any) => {
        return moreFeaturesList.find((screenKey: any) => item.key === screenKey)
      })
      .filter((item = { key: '', title: '' }) => {
        if (isLoggedIn) {
          return item.key !== _loginKey
        } else {
          return !loggedInFeatures.some((screenKey: any) => item.key === screenKey)
        }
      })
  }

  _moreOtherOptions = (membershipStatus?: string) => {
    const allMoreOtherOptions = [
      {
        title: membershipStatus,
        key: _membershipKey,
        routeName: PV.RouteNames.MembershipScreen,
        testID: 'more_screen_membership_cell'
      },
      {
        title: translate('Add Podcast by RSS'),
        key: _addPodcastByRSSKey,
        routeName: PV.RouteNames.AddPodcastByRSSScreen,
        testID: 'more_screen_add_podcast_by_rss_cell'
      },
      {
        title: translate('Contact Us'),
        key: _contactKey,
        testID: 'more_screen_contact_us_cell'
      },
      {
        title: 'FAQ',
        key: _faqKey,
        routeName: PV.RouteNames.FAQScreen,
        testID: 'more_screen_faq_cell'
      },
      {
        title: translate('About brandName'),
        key: _aboutKey,
        routeName: PV.RouteNames.AboutScreen,
        testID: 'more_screen_about_cell'
      },
      {
        title: translate('Terms of Service'),
        key: _termsOfServiceKey,
        routeName: PV.RouteNames.TermsOfServiceScreen,
        testID: 'more_screen_terms_of_service_cell'
      },
      {
        title: translate('Privacy Policy'),
        key: _privacyPolicyKey,
        routeName: PV.RouteNames.PrivacyPolicyScreen,
        testID: 'more_screen_privacy_policy_cell'
      }
    ]

    const moreOtherList = Config.NAV_STACK_MORE_OTHER.split(',')

    const options = allMoreOtherOptions.filter((item: any) => {
      return moreOtherList.find((screenKey: string) => item.key === screenKey)
    })

    return options
  }

  _onPress = (item: any) => {
    const { navigation } = this.props
    if (item.key === _contactKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.CONTACT_US))
    } else if (item.key === _logoutKey) {
      logoutUser()
    } else if (item.key === _myProfileKey) {
      const user = this.global.session.userInfo
      navigation.navigate(PV.RouteNames.ProfileScreen, {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true
      })
    } else if (item.key === _myClipsKey) {
      const user = this.global.session.userInfo
      navigation.navigate(PV.RouteNames.ProfileScreen, {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true,
        initializeClips: true
      })
    } else if (item.key === _aboutKey) {
      Config.URL_SELF_HOSTED_ABOUT_PAGE
        ? Linking.openURL(Config.URL_SELF_HOSTED_ABOUT_PAGE)
        : navigation.navigate(item.routeName)
    } else {
      navigation.navigate(item.routeName)
    }
  }

  render() {
    const { downloadsActive, fontScaleMode, globalTheme, session } = this.global
    const { isLoggedIn = false, userInfo } = session

    let downloadsActiveCount = 0
    for (const id of Object.keys(downloadsActive)) {
      if (downloadsActive[id]) downloadsActiveCount++
    }

    const featureOptions = this._moreFeaturesOptions(isLoggedIn)

    const membershipStatus = getMembershipStatus(userInfo) || translate('Membership')
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const otherOptions = this._moreOtherOptions(membershipStatus)

    return (
      <View style={core.backgroundView} {...testProps('more_screen_view')}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => this._onPress(item)} {...testProps(item.testID)}>
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
                {item.key === _downloadsKey && (
                  <RNView style={[core.row, { position: 'relative' }, table.cellWrapper]}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={table.cellText}>
                      {translate('Downloads')}
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
                {item.key !== _membershipKey && item.key !== _downloadsKey && (
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

const _aboutKey = 'About'
const _addPodcastByRSSKey = 'AddPodcastByRSS'
const _contactKey = 'Contact'
const _downloadsKey = 'Downloads'
const _faqKey = 'FAQ'
const _loginKey = 'Login'
const _logoutKey = 'Logout'
const _membershipKey = 'Membership'
const _myClipsKey = 'MyClips'
const _myProfileKey = 'MyProfile'
const _playlistsKey = 'Playlists'
const _privacyPolicyKey = 'PrivacyPolicy'
const _profilesKey = 'Profiles'
const _settingsKey = 'Settings'
const _termsOfServiceKey = 'TermsOfService'

const allMoreFeatures = [
  {
    title: translate('Downloads'),
    key: _downloadsKey,
    routeName: PV.RouteNames.DownloadsScreen,
    testID: 'more_screen_downloads_cell'
  },
  {
    title: translate('Playlists'),
    key: _playlistsKey,
    routeName: PV.RouteNames.PlaylistsScreen,
    testID: 'more_screen_playlists_cell'
  },
  {
    title: translate('Profiles'),
    key: _profilesKey,
    routeName: PV.RouteNames.ProfilesScreen,
    testID: 'more_screen_profiles_cell'
  },
  {
    title: translate('My Profile'),
    key: _myProfileKey,
    testID: 'more_screen_my_profile_cell'
  },
  {
    title: translate('Log out'),
    key: _logoutKey,
    testID: 'more_screen_log_out_cell'
  },
  {
    title: translate('Login'),
    key: _loginKey,
    routeName: PV.RouteNames.AuthNavigator,
    testID: 'more_screen_login_cell'
  },
  {
    title: translate('Settings'),
    key: _settingsKey,
    routeName: PV.RouteNames.SettingsScreen,
    testID: 'more_screen_settings_cell'
  }
]
