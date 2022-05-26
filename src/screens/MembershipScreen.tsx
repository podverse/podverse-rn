/* eslint-disable max-len */
import { Alert, Platform, StyleSheet } from 'react-native'
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
              navigation={this.props.navigation}
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
    accessibilityLabel: translate('Subscribe to podcasts'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/0e58425b-c6b4-4c4e-8490-ffd771edd3bb/b4a552b3-ed5c-4205-87f1-675410519ab2-1080-fragmented.mp4'
  },
  {
    text: translate('Download episodes'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Download episodes'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/3bdcef88-cb8d-429a-a126-3a6fd65784c9/1a3807fa-7198-4b71-8572-6b9eda207c21-1080-fragmented.mp4'
  },
  {
    text: translate('Audio livestreams'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Audio livestreams'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/bbf6eb1c-46a0-407d-b1ef-682590885882/a4daf0f9-8e10-49ce-814b-43ecebbe10ac-360-fragmented.mp4'
  },
  {
    text: translate('Video playback'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Video playback'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/5dcdf4b0-c154-44ca-9ee4-4ee39af63671/2bf76407-a1fe-479d-ba46-59127d9b81e8-1080-fragmented.mp4'
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
    accessibilityLabel: translate('Sleep timer'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/9bd98b86-7e9a-4c70-b52d-b6e2f5909749/2d65af45-760e-436a-9ac2-22c356ff33ec-1080-fragmented.mp4'
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
    accessibilityLabel: translate('Podcasting 2.0 transcripts'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/e02afb1e-5426-4377-88bf-86ebbb9edd9c/24090cbd-ff14-4c6f-9d40-a2847cf2f9f8-1080-fragmented.mp4'
  },
  {
    text: translate('OPML import and export'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('OPML import and export')
  },
  {
    text: translate('Send Bitcoin donations and boostagrams'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Send Bitcoin donations and boostagrams'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/a1dbaedf-560c-40df-93c5-79a3a3be8f81/0c0192ee-530a-46cf-a799-71d77ff72972-990-fragmented.mp4'
  },
  {
    text: translate('Sync your subscriptions, queue, and history across all your devices'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Sync your subscriptions, queue, and history across all your devices'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/b5a0ca7e-76c0-4b5e-9aa8-31f14505dcee/16e1a414-fdbc-499e-9ecc-8a95d73b9e78-1080-fragmented.mp4'
  },
  {
    text: translate('New episodes and livestream notifications'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('New episodes and livestream notifications'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/bbf6eb1c-46a0-407d-b1ef-682590885882/a4daf0f9-8e10-49ce-814b-43ecebbe10ac-360-fragmented.mp4'
  },
  {
    text: translate('Create and share podcast clips'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Create and share clips'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/4f26b27a-aab7-456c-98d4-a10b46a500e0/4a43118d-8721-4ae0-b33c-40887d8477b0-1080-fragmented.mp4'
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
