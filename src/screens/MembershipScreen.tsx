import { Alert, Platform, StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  ComparisonTable,
  Text,
  TextLink,
  View
} from '../components'
import { hasValidNetworkConnection } from '../lib/network'
import {
  getMembershipExpiration,
  getMembershipStatus,
  readableDate
} from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { buy1YearPremium } from '../services/purchaseShared'
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
  showNoInternetConnectionMessage?: boolean
}

export class MembershipScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Membership'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      disableButton: false,
      isLoading: true
    }
  }

  async componentDidMount() {
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }

    const hasInternetConnection = await hasValidNetworkConnection()

    this.setState({
      isLoading: false,
      showNoInternetConnectionMessage: !hasInternetConnection
    })

    gaTrackPageView('/membership', 'Membership Screen')
  }

  handleRenewPress = async () => {
    this.setState({ disableButton: true }, async () => {
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
    })
  }

  handleSignUpPress = () => {
    this.setState({ disableButton: true }, async () => {
      await this.props.navigation.navigate(PV.RouteNames.AuthScreen, {
        showSignUp: true
      })
      this.setState({ disableButton: false })
    })
  }

  render() {
    const { disableButton, isLoading, showNoInternetConnectionMessage } = this.state
    const { fontScaleMode, globalTheme, session } = this.global
    const { isLoggedIn, userInfo } = session
    const membershipStatus = getMembershipStatus(userInfo)
    const membershipTextStyle = getMembershipTextStyle(
      globalTheme,
      membershipStatus
    )
    const expirationDate = getMembershipExpiration(userInfo)

    const labelStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.label, { fontSize: 10 }] :
      [styles.label]
    const subTextStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.subText, { fontSize: 10 }] :
      [styles.subText]
    const subTextCenteredStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.subTextCentered, { fontSize: 10 }] :
      [styles.subTextCentered]
    const textStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.text, { fontSize: 10 }] :
      [styles.text]

    return (
      <View style={styles.wrapper}>
        {isLoading && isLoggedIn && <ActivityIndicator />}
        {
          !isLoading && showNoInternetConnectionMessage &&
            <View style={styles.textRowCentered}>
              <Text style={[subTextStyle, { textAlign: 'center' }]}>
                Connect to the internet and reload this page to sign up for Premium.
              </Text>
            </View>
        }
        {!isLoading && isLoggedIn && !!membershipStatus && (
          <View>
            <View style={styles.textRow}>
              <Text style={labelStyle}>Status: </Text>
              <Text style={[textStyle, membershipTextStyle]}>
                {membershipStatus}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={labelStyle}>Expires: </Text>
              <Text style={textStyle}>{readableDate(expirationDate)}</Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                disabled={disableButton}
                onPress={this.handleRenewPress}
                style={subTextStyle}>
                Renew Membership
              </TextLink>
            </View>
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View>
            <View style={styles.textRowCentered}>
              <Text style={subTextCenteredStyle}>
                Get 1 year of Podverse Premium for free
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text style={subTextCenteredStyle}>$10/year after that</Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                disabled={disableButton}
                onPress={this.handleSignUpPress}
                style={subTextStyle}>
                Sign Up
              </TextLink>
            </View>
          </View>
        )}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title='Free'
              column2Title='Premium'
              data={comparisonData}
              mainTitle='Features'
            />
          </View>
        )}
      </View>
    )
  }
}

const comparisonData = [
  {
    text: 'subscribe to podcasts',
    column1: true,
    column2: true
  },
  {
    text: 'play clips and episodes',
    column1: true,
    column2: true
  },
  {
    text: 'manage your queue',
    column1: true,
    column2: true
  },
  {
    text: 'create sharable clips of any length',
    column1: true,
    column2: true
  },
  {
    text: 'sleep timer',
    column1: true,
    column2: true
  },
  {
    text: 'sync your subscriptions on all devices',
    column1: false,
    column2: true
  },
  {
    text: 'sync your queue on all devices',
    column1: false,
    column2: true
  },
  {
    text: 'create playlists',
    column1: false,
    column2: true
  },
  {
    text: 'auto save your clips to a playlist',
    column1: false,
    column2: true
  },
  {
    text: 'edit your clips',
    column1: false,
    column2: true
  },
  {
    text: 'share your user profile',
    column1: false,
    column2: true
  },
  {
    text: 'download a backup of your data',
    column1: false,
    column2: true
  },
  {
    text: 'support open source software',
    column1: true,
    column2: true,
    isSmile: true
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
