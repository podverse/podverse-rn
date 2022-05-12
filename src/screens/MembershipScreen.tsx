import { Alert, Platform, StyleSheet } from 'react-native'
import { Purchase } from 'react-native-iap'
import React from 'reactn'
import { ActivityIndicator, Button, ComparisonTable, Text, TextLink, View } from '../components'
import { translate } from '../lib/i18n'
import { getMembershipExpiration, getMembershipStatus, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { buy1YearPremium } from '../services/purchaseShared'
import { trackPageView } from '../services/tracking'
import { getAuthUserInfo } from '../state/actions/auth'
import { androidHandleStatusCheck } from '../state/actions/purchase.android'
import { iosHandlePurchaseStatusCheck } from '../state/actions/purchase.ios'
import { getMembershipTextStyle } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  disableButton: boolean
  isLoading: boolean
}

const testIDPrefix = 'membership_screen'

export class MembershipScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      disableButton: false,
      isLoading: true
    }
  }

  static navigationOptions = () => ({
    title: translate('Membership')
  })

  async componentDidMount() {
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }

    this.setState({ isLoading: false })

    trackPageView('/membership', 'Membership Screen')
  }

  handleRenewPress = () => {
    this.setState({ disableButton: true }, () => {
      (async () => {
        try {
          await buy1YearPremium()
        } catch (error) {
          console.log(error)
          // If attempting to renew, but a recent previous purchase did not complete successfully,
          // then do not buy a new product, and instead navigate to the PurchasingScreen
          // and attempt to check and update the status of the cached purchase.
          if (error.code === 'E_ALREADY_OWNED') {
            const { purchase } = this.global
            if (Platform.OS === 'android') {
              this.props.navigation.navigate(PV.RouteNames.PurchasingScreen)
              await androidHandleStatusCheck(purchase)
            } else if (Platform.OS === 'ios') {
              this.props.navigation.navigate(PV.RouteNames.PurchasingScreen)
              await iosHandlePurchaseStatusCheck(purchase)
            }
          } else if (error.code === 'E_USER_CANCELLED') {
            // do nothing
          } else {
            Alert.alert(
              PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.title,
              PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.message,
              PV.Alerts.BUTTONS.OK
            )
          }
        }
        this.setState({ disableButton: false })
      })()
    })
  }

  handleSignUpPress = () => {
    this.setState({ disableButton: true }, () => {
      (async () => {
        await this.props.navigation.navigate(PV.RouteNames.AuthScreen, {
          showSignUp: true,
          title: translate('Sign Up')
        })
        this.setState({ disableButton: false })
      })()
    })
  }

  render() {
    const { disableButton, isLoading } = this.state
    const { globalTheme, session } = this.global
    const { isLoggedIn, userInfo } = session
    const membershipStatus = getMembershipStatus(userInfo)
    const membershipTextStyle = getMembershipTextStyle(globalTheme, membershipStatus)
    const expirationDate = getMembershipExpiration(userInfo)
    const statusAccessibilityLabel = `${translate('Status')}: ${membershipStatus}`
    const expiresAccessibilityLabel = `${translate('Expires')}: ${readableDate(expirationDate)}`

    return (
      <View style={styles.wrapper} testID={`${testIDPrefix}_view`}>
        {isLoading && isLoggedIn && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && isLoggedIn && !!membershipStatus && (
          <View>
            <View
              accessible
              // eslint-disable-next-line max-len
              accessibilityHint={translate(
                'ARIA HINT - This is the membership status of your currently logged-in account'
              )}
              accessibilityLabel={statusAccessibilityLabel}
              style={styles.textRowCentered}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={styles.label}
                testID={`${testIDPrefix}_status_label`}>
                {translate('Status')}{' '}
              </Text>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={[styles.text, membershipTextStyle]}
                testID={`${testIDPrefix}_status_membership`}>
                {membershipStatus}
              </Text>
            </View>
            <View
              accessible
              accessibilityHint={translate(
                'ARIA HINT - This is the date your premium membership will expire unless it is renewed'
              )}
              accessibilityLabel={expiresAccessibilityLabel}
              style={styles.textRowCentered}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={styles.label}
                testID={`${testIDPrefix}_expires`}>
                {`${translate('Expires')}: `}
              </Text>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={styles.text}
                testID={`${testIDPrefix}_expiration_date`}>
                {readableDate(expirationDate)}
              </Text>
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                accessibilityHint={translate('ARIA HINT - renew your premium membership')}
                disabled={disableButton}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                isSuccess
                onPress={this.handleRenewPress}
                testID={`${testIDPrefix}_renew_membership`}
                text={translate('Renew Membership')}
                wrapperStyles={styles.button}
              />
            </View>
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View>
            <View style={styles.textRowCentered}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.subTextCentered}>
                {translate('Enjoy Podverse Premium')}
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.subTextCentered}>
                {translate('3 months free')}
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.subTextCentered}>
                {translate('18 per year after that')}
              </Text>
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                disabled={disableButton}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                isPrimary
                onPress={this.handleSignUpPress}
                testID={`${testIDPrefix}_sign_up`}
                text={translate('Sign Up')}
                wrapperStyles={styles.button}
              />
            </View>
          </View>
        )}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title={translate('Free')}
              column2Title={translate('Premium')}
              data={comparisonData}
              mainTitle={translate('Features')}
              mainTitleAccessibilityHint={translate('ARIA HINT - Membership features header')}
            />
          </View>
        )}
      </View>
    )
  }
}

const comparisonData = [
  {
    text: translate('Subscribe to podcasts'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Subscribe to podcasts')
  },
  {
    text: translate('Download episodes'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Download episodes')
  },
  {
    text: translate('Audio livestreams'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Audio livestreams')
  },
  {
    text: translate('Video playback'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Video playback')
  },
  {
    text: translate('Add custom RSS feeds'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Add custom RSS feeds')
  },
  {
    text: translate('Sleep timer'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Sleep timer')
  },
  {
    text: translate('Screen-reader accessibility'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Screen-reader accessibility')
  },
  {
    text: translate('Podcasting 2.0 chapters'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Podcasting 2.0 chapters')
  },
  {
    text: translate('Podcasting 2.0 cross-app comments'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Podcasting 2.0 cross-app comments')
  },
  {
    text: translate('Podcasting 2.0 transcripts'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Podcasting 2.0 transcripts')
  },
  {
    text: translate('OPML import and export'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('OPML import and export')
  },
  {
    text: translate('Sync your subscriptions, queue, and history across all your devices'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Sync your subscriptions, queue, and history across all your devices')
  },
  {
    text: translate('New episodes and livestream notifications'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('New episodes and livestream notifications')
  },
  {
    text: translate('Create and share podcast clips'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Create and share clips')
  },
  {
    text: translate('Create and share playlists'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Create and share playlists')
  },
  {
    text: translate('Mark episodes as played'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Mark episodes as played')
  },
  {
    text: translate('Subscribe to listener profiles'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Subscribe to listener profiles')
  },
  {
    text: translate('Support open source software'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Support open source software'),
    isSmile: true
  }
]

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    height: 32,
    marginBottom: 16
  },
  buttonWrapper: {
    marginBottom: 16,
    marginTop: 20,
    paddingHorizontal: 32
  },
  label: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  subText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingVertical: 4
  },
  subTextCentered: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center'
  },
  tableWrapper: {
    flex: 1,
    marginTop: 12
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  textCentered: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center'
  },
  textRow: {
    flexDirection: 'row',
    margin: 8
  },
  textRowCentered: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 4,
    justifyContent: 'center',
    textAlign: 'center'
  },
  wrapper: {
    flex: 1,
    paddingTop: 8
  }
})
