import { Linking, SectionList, TouchableWithoutFeedback, View as RNView } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { Divider, TableSectionSelectors, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl, getMembershipStatus, testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
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
    trackPageView('/more', 'More Screen')
  }

  _moreFeaturesOptions = (isLoggedIn: boolean) => {
    const moreFeaturesList = Config.NAV_STACK_MORE_FEATURES.split(',')
    const loggedInFeatures = [_logoutKey]

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
        title: translate('Contact Us'),
        key: _contactKey,
        testID: 'more_screen_contact_us_cell'
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
    } else {
      navigation.navigate(item.routeName)
    }
  }

  render() {
    const { globalTheme, session } = this.global
    const { isLoggedIn = false, userInfo } = session

    const featureOptions = this._moreFeaturesOptions(isLoggedIn)

    const membershipStatus = getMembershipStatus(userInfo) || null
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const otherOptions = this._moreOtherOptions(membershipStatus)

    return (
      <View style={core.backgroundView} {...testProps('more_screen_view')}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => this._onPress(item)} {...testProps(item.testID)}>
              <RNView style={[core.row, table.cellWrapper]}>
                {item.key === _membershipKey ? (
                  <RNView style={[core.row, table.cellWrapper]}>
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.md}
                      style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                      {translate('Membership')}
                    </Text>
                    {isLoggedIn && (
                      <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[table.cellText, membershipTextStyle]}>
                        <Text>- </Text>
                        {membershipStatus}
                      </Text>
                    )}
                  </RNView>
                ) : (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                    {item.title}
                  </Text>
                )}
              </RNView>
            </TouchableWithoutFeedback>
          )}
          renderSectionHeader={({ section }) => {
            return <TableSectionSelectors hideFilter={true} includePadding={true} selectedFilterLabel={section.title} />
          }}
          sections={[
            { title: translate('Features'), data: featureOptions },
            { title: translate('Other'), data: otherOptions }
          ]}
          stickySectionHeadersEnabled={false}
        />
      </View>
    )
  }
}

const _aboutKey = 'About'
const _addPodcastByRSSKey = 'AddPodcastByRSS'
const _contactKey = 'Contact'
const _loginKey = 'Login'
const _logoutKey = 'Logout'
const _membershipKey = 'Membership'
const _privacyPolicyKey = 'PrivacyPolicy'
const _settingsKey = 'Settings'
const _termsOfServiceKey = 'TermsOfService'

const allMoreFeatures = [
  {
    title: translate('Add Custom RSS Feed'),
    key: _addPodcastByRSSKey,
    routeName: PV.RouteNames.AddPodcastByRSSScreen,
    testID: 'more_screen_add_podcast_by_rss_cell'
  },
  {
    title: translate('Settings'),
    key: _settingsKey,
    routeName: PV.RouteNames.SettingsScreen,
    testID: 'more_screen_settings_cell'
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
  }
]
