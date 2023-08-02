/* eslint-disable max-len */
import { Alert, Platform, StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Button, ComparisonTable, Text, View } from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import {
  checkIfExpiredMembership,
  checkIfValidFreeTrialMembership,
  getMembershipExpiration,
  getMembershipStatus
} from '../lib/membership'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { buy1YearPremium } from '../services/purchaseShared'
import { trackPageView } from '../services/tracking'
import { getAuthUserInfo } from '../state/actions/auth'
import { androidHandleStatusCheck } from '../state/actions/purchase.android'
import { iosHandlePurchaseStatusCheck } from '../state/actions/purchase.ios'
import { getMembershipTextStyle } from '../styles'

const _fileName = 'src/screens/MembershipScreen.tsx'

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
          errorLogger(_fileName, 'handleRenewPress', error)
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
    const expiresLabel = checkIfExpiredMembership(membershipStatus) ? translate('Expired') : translate('Expires')
    const isValidFreeTrial = checkIfValidFreeTrialMembership(membershipStatus)
    const isValidMembership = !checkIfExpiredMembership(membershipStatus)
    const renewButtonLabel = isValidMembership ? translate('Extend Membership') : translate('Renew Membership')
    const renewMembershipExplanation = isValidMembership
      ? translate('Your membership is still valid')
      : translate('Enjoy all Premium features by renewing for only')
    const renewMembershipExplanation2 = isValidFreeTrial
      ? translate('Your membership will not auto-renew')
      : translate('You are not being charged during your free trial')

    const renewMembershipExplanation3 = isLoggedIn
      ? ''
      : translate('Feature unavailable for manually added feeds')

    const listHeaderComponent = (
      <View style={styles.listHeaderWrapper}>
        {isLoggedIn && !!membershipStatus && (
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
                style={[styles.textLargest, membershipTextStyle]}
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
                {`${expiresLabel}: `}
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
                text={renewButtonLabel}
                wrapperStyles={styles.button}
              />
            </View>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={styles.explainText}
              testID={`${testIDPrefix}_renew_explanation`}>
              {`${renewMembershipExplanation} ${renewMembershipExplanation2}`}
            </Text>
          </View>
        )}
        {!isLoggedIn && (
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
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={styles.explainText}
              testID={`${testIDPrefix}_renew_explanation_sign_up`}>
              {translate('You will not be charged for signing up for your free trial')}
            </Text>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={styles.explainText}
              testID={`${testIDPrefix}_renew_explanation_asterisk`}>
              {`* ${renewMembershipExplanation3}`}
            </Text>
          </View>
        )}
      </View>
    )

    return (
      <View style={styles.wrapper} testID={`${testIDPrefix}_view`}>
        {isLoading && isLoggedIn && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title={translate('Free')}
              column2Title={translate('Premium')}
              data={comparisonData}
              listHeaderComponent={listHeaderComponent}
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
      'https://peertube.podverse.fm/static/streaming-playlists/hls/04138079-cc99-41ae-8080-8a5ed34be417/1a8cdb78-0065-40b8-8db8-62995724e7bc-1080-fragmented.mp4'
  },
  {
    text: translate('Audio livestreams'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Audio livestreams'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/bbf6eb1c-46a0-407d-b1ef-682590885882/ba490a30-5e85-41ea-aae7-72b8bc2aac75-828-fragmented.mp4'
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
    accessibilityLabel: translate('Add custom RSS feeds'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/8c6541ac-9523-42a9-9f6b-b8e1629720ee/e8eb02b6-eaa4-4ec7-a8fd-5380ca041b95-1080-fragmented.mp4'
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
    accessibilityLabel: translate('Podcasting 2.0 chapters'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/2c27da49-6df8-4d86-9d4b-b617af5ef3dc/1f4bd85b-9749-433c-bc20-eda78cb38068-1080-fragmented.mp4'
  },
  {
    text: translate('Podcasting 2.0 cross-app comments'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Podcasting 2.0 cross-app comments'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/e214c3a9-9c2e-4d70-9f88-c3820a7189df/1162def8-8c14-47d3-b77f-59856c14e067-1080-fragmented.mp4'
  },
  {
    text: translate('Podcasting 2.0 transcripts'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('Podcasting 2.0 transcripts'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/67764a9d-12e0-4c25-9ae8-746efe484fa2/91b7fc2c-5c9f-48ff-a786-7fb5515931ba-1080-fragmented.mp4'
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
      'https://peertube.podverse.fm/static/streaming-playlists/hls/b5a0ca7e-76c0-4b5e-9aa8-31f14505dcee/16e1a414-fdbc-499e-9ecc-8a95d73b9e78-1080-fragmented.mp4',
    hasAsterisk: true
  },
  {
    text: translate('New episodes and livestream notifications'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('New episodes and livestream notifications'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/bbf6eb1c-46a0-407d-b1ef-682590885882/ba490a30-5e85-41ea-aae7-72b8bc2aac75-828-fragmented.mp4',
    hasAsterisk: true
  },
  {
    text: translate('Create and share podcast clips'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Create and share clips'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/4f26b27a-aab7-456c-98d4-a10b46a500e0/4a43118d-8721-4ae0-b33c-40887d8477b0-1080-fragmented.mp4',
    hasAsterisk: true
  },
  {
    text: translate('Create and share playlists'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Create and share playlists'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/2a1d5f03-7415-4462-9758-738f7c93f68c/af4476db-8f7d-4e5f-8886-d03dfa2ef3e7-1080-fragmented.mp4',
    hasAsterisk: true
  },
  {
    text: translate('Mark episodes as played'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('Mark episodes as played'),
    videoUrl:
      'https://peertube.podverse.fm/static/streaming-playlists/hls/ba616db8-9b46-436a-994f-383ff66576a2/a8ab3251-31be-4005-b45e-081c72be7b67-1080-fragmented.mp4',
    hasAsterisk: true
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
    marginBottom: 20
  },
  buttonWrapper: {
    marginBottom: 28,
    marginTop: 22,
    paddingHorizontal: 32
  },
  explainText: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 16,
    paddingHorizontal: 16,
    textAlign: 'center'
  },
  label: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  listHeaderWrapper: {
    marginBottom: 24
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
  textLargest: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold
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
