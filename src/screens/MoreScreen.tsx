import AsyncStorage from '@react-native-community/async-storage'
import { parseOpmlFile } from 'podverse-shared'
import { SectionList, Alert, Linking } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { parseString } from 'react-native-xml2js'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import { Divider, TableSectionSelectors, Text, View, ActivityIndicator, TableCell } from '../components'
import { errorLogger } from '../lib/debug'
import { translate } from '../lib/i18n'
import { getMembershipStatus } from '../lib/membership'
import { exportSubscribedPodcastsAsOPML } from '../lib/opmlExport'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { logoutUser } from '../state/actions/auth'
import { core, getMembershipTextStyle, table } from '../styles'
import { addAddByRSSPodcasts } from '../state/actions/parser'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
  isLoading: boolean
}

const testIDPrefix = 'more_screen'

export class MoreScreen extends React.Component<Props, State> {
  state = {
    options: [],
    isLoading: false
  }

  static navigationOptions = () => ({
    title: translate('More')
  })

  componentDidMount() {
    trackPageView('/more', 'More Screen')
    const {opmlUri} = this.props.navigation?.state?.params || {}
    
    if (opmlUri) {
      this._importOpml(this.props.navigation.state.params.opmlUri)
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const {opmlUri} = this.props.navigation?.state?.params || {}

    if (opmlUri && opmlUri !== prevProps.navigation?.state?.params?.opmlUri) {
      this._importOpml(this.props.navigation.state.params.opmlUri)
    }
  }

  _moreFeaturesOptions = (isLoggedIn: boolean) => {
    const moreFeaturesList = Config.NAV_STACK_MORE_FEATURES.split(',')
    const loggedInFeatures = [_logoutKey]

    return allMoreFeatures
      .filter((item: any) => moreFeaturesList.find((screenKey: any) => item.key === screenKey))
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
        routeName: PV.RouteNames.MembershipScreen
      },
      {
        title: translate('Contact'),
        key: _contactKey,
        routeName: PV.RouteNames.ContactScreen
      },
      {
        title: translate('Contribute'),
        key: _supportKey,
        routeName: PV.RouteNames.ContributeScreen
      },
      {
        title: translate('About'),
        key: _aboutKey,
        routeName: PV.RouteNames.AboutScreen
      },
      {
        title: translate('Tutorials'),
        key: _tutorialsKey
      },
      {
        title: translate('Terms of Service'),
        key: _termsOfServiceKey,
        routeName: PV.RouteNames.TermsOfServiceScreen
      },
      {
        title: translate('Privacy Policy'),
        key: _privacyPolicyKey,
        routeName: PV.RouteNames.PrivacyPolicyScreen
      }
    ]

    const moreOtherList = Config.NAV_STACK_MORE_OTHER.split(',')

    const options = allMoreOtherOptions.filter((item: any) =>
      moreOtherList.find((screenKey: string) => item.key === screenKey)
    )

    return options
  }

  _handleV4VProvidersPressed = async () => {
    const consentGivenString = await AsyncStorage.getItem(PV.Keys.USER_CONSENT_VALUE_TAG_TERMS)
    if (consentGivenString && JSON.parse(consentGivenString) === true) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersScreen)
    } else {
      this.props.navigation.navigate(PV.RouteNames.V4VPreviewScreen)
    }
  }

  _importOpml = async (uri?: string) => {
    try {
      if (!uri) {
        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.allFiles]
        })

        if (!res) {
          throw new Error('Something went wrong with the import process.')
        }

        uri = res.uri
      }
      const contents = await RNFS.readFile(decodeURI(uri), 'utf8')

      this.setState({ isLoading: true }, () => {
        parseString(contents, async (err: any, result: any) => {
          try {
            if (err) {
              throw err
            } else if (!result?.opml?.body[0]?.outline) {
              throw new Error('OPML file is not in the correct format')
            }

            const rssArr = parseOpmlFile(result, true)
            await addAddByRSSPodcasts(rssArr)

            this.setState({ isLoading: false }, () => {
              this.props.navigation.navigate(PV.RouteNames.PodcastsScreen)
            })
          } catch (error) {
            errorLogger('Error parsing podcast: ', error)
            this.setState({ isLoading: false })
          }
        })
      })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        errorLogger('Error parsing podcast: ', err)
        Alert.alert('Error', 'There was an issue with the opml file import.', err.message)
      }
    }
  }

  _handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  _onPress = async (item: any) => {
    const { navigation } = this.props
    if (item.key === _logoutKey) {
      logoutUser()
    } else if (item.key === _value4ValueKey) {
      this._handleV4VProvidersPressed()
    } else if (item.key === _importOpml) {
      this._importOpml()
    } else if (item.key === _exportOpml) {
      exportSubscribedPodcastsAsOPML()
    } else if (item.key === _tutorialsKey) {
      const useRedirectDomain = true
      const urls = await PV.URLs.web(useRedirectDomain)
      const { tutorials } = urls
      this._handleFollowLink(tutorials)
    } else {
      navigation.navigate(item.routeName)
    }
  }

  render() {
    const { globalTheme, session } = this.global
    const { isLoggedIn = false, userInfo } = session

    const featureOptions = this._moreFeaturesOptions(isLoggedIn)

    const membershipStatus = getMembershipStatus(userInfo) || ''
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const otherOptions = this._moreOtherOptions(membershipStatus)

    const membershipAccessibilityLabel = `${translate('Membership')}${isLoggedIn ? ' – ' : ''} ${
      membershipStatus ? membershipStatus : ''
    }`

    return (
      <View style={core.backgroundView} testID={`${testIDPrefix}_view`}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => {
            const { appMode } = this.global
            let appModeSelectedText = translate('Podcasts')
            if (appMode === PV.AppMode.videos) {
              appModeSelectedText = translate('Videos')
            }
            const modeLabel = `${translate('Mode')}: ${appModeSelectedText}`

            const accessibilityLabel =
              item.key === _membershipKey
                ? membershipAccessibilityLabel
                : item.key === _appModeKey
                ? modeLabel
                : item.title

            return (
              <TableCell
                accessibilityLabel={accessibilityLabel}
                onPress={() => this._onPress(item)}
                testIDPrefix={`${testIDPrefix}_${item.key}`}
                testIDSuffix=''>
                <>
                  {item.key === _appModeKey && (
                    <Text
                      accessibilityLabel={modeLabel}
                      fontSizeLargestScale={PV.Fonts.largeSizes.md}
                      style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                      {modeLabel}
                    </Text>
                  )}
                  {item.key === _membershipKey && (
                    <>
                      {!isLoggedIn && (
                        <Text
                          fontSizeLargestScale={PV.Fonts.largeSizes.md}
                          style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                          {`${translate('Membership')}`}
                        </Text>
                      )}
                      {isLoggedIn && (
                        <Text
                          fontSizeLargestScale={PV.Fonts.largeSizes.md}
                          style={[table.cellText, membershipTextStyle]}>
                          {`${translate('Membership')} – ${membershipStatus}`}
                        </Text>
                      )}
                    </>
                  )}
                  {item.key !== _appModeKey && item.key !== _membershipKey && (
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.md}
                      style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                      {item.title}
                    </Text>
                  )}
                </>
              </TableCell>
            )
          }}
          renderSectionHeader={({ section }) => (
            <TableSectionSelectors
              disableFilter
              includePadding
              selectedFilterLabel={section.title}
              textStyle={[globalTheme.headerText, core.sectionHeaderText]}
            />
          )}
          sections={[
            { title: translate('Features'), data: featureOptions },
            { title: translate('Other'), data: otherOptions }
          ]}
          stickySectionHeadersEnabled={false}
        />
        {this.state.isLoading && (
          <ActivityIndicator
            isOverlay
            loadingMessage={`${translate('Importing Feeds')}\n${translate('This may take a while')}`}
            testID={testIDPrefix}
            transparent={false}
          />
        )}
      </View>
    )
  }
}

const _aboutKey = 'About'
const _addPodcastByRSSKey = 'AddPodcastByRSS'
const _appModeKey = 'AppMode'
const _contactKey = 'Contact'
const _loginKey = 'Login'
const _logoutKey = 'Logout'
const _membershipKey = 'Membership'
const _privacyPolicyKey = 'PrivacyPolicy'
const _settingsKey = 'Settings'
const _supportKey = 'Support'
const _termsOfServiceKey = 'TermsOfService'
const _tutorialsKey = 'Tutorials'
const _importOpml = 'ImportOpml'
const _exportOpml = 'ExportOpml'
const _value4ValueKey = 'Value4Value'

const allMoreFeatures = [
  {
    title: translate('Login'),
    key: _loginKey,
    routeName: PV.RouteNames.AuthNavigator
  },
  {
    title: translate('Add Custom RSS Feed'),
    key: _addPodcastByRSSKey,
    routeName: PV.RouteNames.AddPodcastByRSSScreen
  },
  {
    title: translate('Value for Value'),
    key: _value4ValueKey
  },
  {
    title: translate('Settings'),
    key: _settingsKey,
    routeName: PV.RouteNames.SettingsScreen
  },
  {
    title: translate('Mode'),
    key: _appModeKey,
    routeName: PV.RouteNames.AppModeScreen
  },
  {
    title: translate('Import OPML'),
    key: _importOpml
  },
  {
    title: translate('Export OPML'),
    key: _exportOpml
  },
  {
    title: translate('Log out'),
    key: _logoutKey
  }
]
