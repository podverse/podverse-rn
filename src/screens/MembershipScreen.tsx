import { Alert, Platform, StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, ComparisonTable, Text, TextLink, View } from '../components'
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
            if (Platform.OS === 'android') {
              this.props.navigation.navigate(PV.RouteNames.PurchasingScreen)
              const { productId, purchaseToken, transactionId } = this.global.purchase
              await androidHandleStatusCheck(productId, transactionId, purchaseToken)
            } else if (Platform.OS === 'ios') {
              this.props.navigation.navigate(PV.RouteNames.PurchasingScreen)
              const { productId, transactionId, transactionReceipt } = this.global.purchase
              await iosHandlePurchaseStatusCheck(productId, transactionId, transactionReceipt)
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
      <View
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && isLoggedIn && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && isLoggedIn && !!membershipStatus && (
          <View>
            <View
              accessible
              // eslint-disable-next-line max-len
              accessibilityHint={translate('ARIA HINT - This is the membership status of your currently logged-in account')}
              accessibilityLabel={statusAccessibilityLabel}
              style={styles.textRow}>
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
              accessibilityHint={
                translate('ARIA HINT - This is the date your premium membership will expire unless it is renewed')}
              accessibilityLabel={expiresAccessibilityLabel}
              style={styles.textRow}>
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
            <View style={styles.textRowCentered}>
              <TextLink
                accessibilityHint={translate('ARIA HINT - renew your premium membership')}
                disabled={disableButton}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                onPress={this.handleRenewPress}
                style={styles.subText}
                testID={`${testIDPrefix}_renew_membership`}
                text={translate('Renew Membership')} />
            </View>
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View>
            <View style={styles.textRowCentered}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.subTextCentered}>
                {translate('Get 1 year of Premium for free')}
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.subTextCentered}>
                {translate('10 per year after that')}
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                accessibilityHint={translate('ARIA HINT - sign up for your premium account')}
                disabled={disableButton}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                onPress={this.handleSignUpPress}
                style={styles.subText}
                testID={`${testIDPrefix}_sign_up`}
                text={translate('Sign Up')} />
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
    text: translate('subscribe to podcasts'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Subscribe to podcasts')
  },
  {
    text: translate('download episodes'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Download episodes')
  },
  {
    text: translate('drag-and-drop queue'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Drag and drop queue')
  },
  {
    text: translate('sleep timer'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Sleep timer')
  },
  {
    text: translate('create and share clips'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Create and share clips')
  },
  {
    text: translate('sync your subscriptions on all devices'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Sync your subscriptions on all devices')
  },
  {
    text: translate('sync your queue on all devices'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Sync your queue on all devices')
  },
  {
    text: translate('create playlists'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Create playlists')
  },
  {
    text: translate('download a backup of your data'),
    column1: false,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Download a backup of your data')
  },
  {
    text: translate('support free and open source software'),
    column1: true,
    column2: true,
    accessibilityLabel: translate('ARIA HINT - Membership - Support free and open source software')
  }
]

const styles = StyleSheet.create({
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
