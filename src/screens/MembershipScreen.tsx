import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  ComparisonTable,
  Text,
  TextLink,
  View
} from '../components'
import {
  getMembershipExpiration,
  getMembershipStatus,
  readableDate
} from '../lib/utility'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { getMembershipTextStyle } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
}

export class MembershipScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Membership'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  async componentDidMount() {
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })
  }

  handleSignUpPress = () => {
    this.props.navigation.navigate(PV.RouteNames.AuthScreen, {
      showSignUp: true
    })
  }

  render() {
    const { isLoading } = this.state
    const { globalTheme, session } = this.global
    const { isLoggedIn, userInfo } = session
    const membershipStatus = getMembershipStatus(userInfo)
    const membershipTextStyle = getMembershipTextStyle(
      globalTheme,
      membershipStatus
    )
    const expirationDate = getMembershipExpiration(userInfo)

    return (
      <View style={styles.wrapper}>
        {isLoading && isLoggedIn && <ActivityIndicator />}
        {/*       // start: temporarily disable login
                          also not sure how this condition even works
         */}
        {/* {!isLoading && isLoggedIn && !membershipStatus && (
          <View>
            <View style={styles.textRow}>
              <Text style={[styles.subText]}>
                Connect to the internet to view your membership status.
              </Text>
            </View>
          </View>
        )} */}
        {!isLoading && isLoggedIn && membershipStatus && (
          <View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Status: </Text>
              <Text style={[styles.text, membershipTextStyle]}>
                {membershipStatus}
              </Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Expires: </Text>
              <Text style={[styles.text]}>{readableDate(expirationDate)}</Text>
            </View>
            {/* <View style={styles.textRow}>
                <Text style={[styles.subText]}>
                  To renew your membership, go to podverse.fm, login, then visit your Settings page.
                </Text>
              </View> */}
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View style={styles.textRowCentered}>
            <Text style={styles.subTextCentered}>
              Podverse premium accounts are currently available by invite only.
            </Text>
          </View>
        )}
        {!isLoading && !isLoggedIn && (
          <View>
            <View style={styles.textRowCentered}>
              <Text style={styles.subTextCentered}>
                Get 1 year of Podverse Premium for free
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <Text style={styles.subTextCentered}>
                $10 per year after that
              </Text>
            </View>
            <View style={styles.textRowCentered}>
              <TextLink
                onPress={this.handleSignUpPress}
                style={[styles.subText]}>
                Sign Up
              </TextLink>
            </View>
          </View>
        )}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title="Free"
              column2Title="Premium"
              data={comparisonData}
              mainTitle="Features"
            />
          </View>
        )}
        {!isLoading && (
          <View style={styles.tableWrapper}>
            <ComparisonTable
              column1Title="Free"
              column2Title="Premium"
              data={comparisonData}
              mainTitle="Features"
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
    text: 'automatically save your clips to a playlist',
    column1: false,
    column2: true
  },
  {
    text: 'edit your clips',
    column1: false,
    column2: true
  },
  {
    text: 'create playlists',
    column1: false,
    column2: true
  },
  {
    text: 'share your profile',
    column1: false,
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
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold
  },
  subTextCentered: {
    fontSize: PV.Fonts.sizes.lg,
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
    margin: 8,
    justifyContent: 'center',
    textAlign: 'center'
  },
  wrapper: {
    flex: 1,
    // start: temporarily disable login
    // paddingTop: 8
  }
})
