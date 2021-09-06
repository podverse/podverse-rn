import { ValueTransaction } from 'podverse-shared'
import { Alert, Keyboard, Linking, Pressable, StyleSheet, TouchableOpacity } from 'react-native'
import Config from 'react-native-config'
import React, { getGlobal } from 'reactn'
import AsyncStorage from '@react-native-community/async-storage'
import { Divider, FastImage, NavDismissIcon, ScrollView, Text,
  TextInput, ValueTagInfoView, View } from '../components'
import { ValueTransactionRouteError } from '../components/ValueTagInfoView'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { convertValueTagIntoValueTransactions } from '../lib/valueTagHelpers'
import { PV } from '../resources'
import { checkLNPayRecipientRoute } from '../services/lnpay'
import { trackPageView } from '../services/tracking'
import { getLNWallet } from '../state/actions/lnpay'
import { images } from '../styles'

type Props = any
type State = {
  boostTransactions: ValueTransaction[]
  streamingTransactions: ValueTransaction[]
  erroringTransactions: ValueTransactionRouteError[]
}

const testIDPrefix = 'funding_screen'

export class FundingScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      boostTransactions: [],
      streamingTransactions: [],
      erroringTransactions: []
    }
  }
  
  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()

    return {
      title: translate('Funding'),
      headerLeft: () => (
        <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />
      ),
      headerRight: null
    }
  }

  async componentDidMount() {
    const { player, podcastValueFinal, session } = this.global
    const { nowPlayingItem } = player
    const { boostAmount, streamingAmount } = session?.valueTagSettings?.lightningNetwork?.lnpay?.globalSettings || {}

    const { episodeValue, podcastValue } = nowPlayingItem
    const valueTags = podcastValueFinal
      || (episodeValue?.length && episodeValue)
      || (podcastValue?.length && podcastValue)

    // TODO: right now we are assuming the first item will be the lightning network.
    // This will need to be updated to support additional valueTags.
    const valueTag = valueTags[0]

    const roundDownBoostTransactions = true
    const boostTransactions = await convertValueTagIntoValueTransactions(
      valueTag,
      nowPlayingItem,
      PV.ValueTag.ACTION_BOOST,
      boostAmount,
      roundDownBoostTransactions
    )
    const roundDownStreamingTransactions = false
    const streamingTransactions = await convertValueTagIntoValueTransactions(
      valueTag,
      nowPlayingItem,
      PV.ValueTag.ACTION_STREAMING,
      streamingAmount,
      roundDownStreamingTransactions
    )
    this.setState({ boostTransactions, streamingTransactions }, () => {
      this.checkForErroringTransactions()
    })

    trackPageView('/funding', 'Funding Screen')
  }

  checkForErroringTransactions = async () => {
    const wallet = await getLNWallet()
    const erroringTransactions = []

    if (wallet) {
      const { boostTransactions } = this.state
 
      for (const boostTransaction of boostTransactions) {
        try {
          if (boostTransaction.normalizedValueRecipient.amount >= 1) {
            await checkLNPayRecipientRoute(wallet, boostTransaction.normalizedValueRecipient)
          }
        } catch (error) {
          if (error?.response?.data?.status === 400) {
            erroringTransactions.push({
              address: boostTransaction.normalizedValueRecipient.address,
              message: error.response.data.message
            })
          }
        }
      }

      if (erroringTransactions.length) {
        this.setState({ erroringTransactions })
      }
    }
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(url) }
    ])
  }

  renderFundingLink = (item: any, type: string, index: number) => {
    const { url, value } = item
    if (!url || !value) return null
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => this.handleFollowLink(url)}>
        <Text
          key={`${testIDPrefix}-${type}-link-${index}`}
          style={styles.fundingLink}
          testID={`${testIDPrefix}_${type}_link_${index}`}>
          {value}
        </Text>
      </TouchableOpacity>
    )
  }

  _handleValueTagSetupPressed = async () => {
    const consentGivenString = await AsyncStorage.getItem(PV.Keys.USER_CONSENT_VALUE_TAG_TERMS)
    if (consentGivenString && JSON.parse(consentGivenString) === true) {
      this.props.navigation.navigate(PV.RouteNames.ValueTagSetupScreen)
    } else {
      this.props.navigation.navigate(PV.RouteNames.ValueTagPreviewScreen)
    }
  }

  render() {
    const { boostTransactions, streamingTransactions, erroringTransactions } = this.state
    const { player, podcastValueFinal, session } = this.global
    const { nowPlayingItem } = player
    const podcastFunding = nowPlayingItem?.podcastFunding || []
    const episodeFunding = nowPlayingItem?.episodeFunding || []

    const { globalSettings, lnpayEnabled } = session?.valueTagSettings?.lightningNetwork?.lnpay || {}
    const { boostAmount, streamingAmount } = globalSettings || {}

    const podcastLinks = podcastFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'podcast', index)
    )
    const episodeLinks = episodeFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'episode', index)
    )
    const hasValueInfo =
      !!Config.ENABLE_VALUE_TAG_TRANSACTIONS && (
        podcastValueFinal?.length > 0
        || nowPlayingItem?.episodeValue?.length > 0
        || nowPlayingItem?.podcastValue?.length > 0
      )

    const podcastTitle = nowPlayingItem?.podcastTitle.trim() || translate('Untitled Podcast')
    const episodeTitle = nowPlayingItem?.episodeTitle.trim() || translate('Untitled Episode')
    const pubDate = readableDate(nowPlayingItem.episodePubDate)
    const headerAccessibilityLabel = `${podcastTitle}, ${episodeTitle}, ${pubDate}`

    return (
      <View
        style={styles.content}
        testID='funding_screen_view'>
        <View
          accessible
          accessibilityLabel={headerAccessibilityLabel}
          style={styles.innerTopView}>
          <FastImage isSmall source={nowPlayingItem.podcastShrunkImageUrl} styles={styles.image} />
          <View style={{ flex: 1 }}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testIDPrefix}_podcast_title`}>
              {podcastTitle}
            </Text>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={styles.episodeTitle}
              testID={`${testIDPrefix}_episode_title`}>
              {episodeTitle}
            </Text>
            <View style={styles.textWrapperBottomRow}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary
                style={styles.pubDate}
                testID={`${testIDPrefix}_pub_date`}>
                {pubDate}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {hasValueInfo && (
            <Text
              // eslint-disable-next-line max-len
              accessibilityHint={translate('ARIA HINT - This section provides the value-for-value information for this podcast')}
              accessibilityLabel={translate('Value-for-Value')}
              accessibilityRole='header'
              style={styles.textHeader}
              testID={`${testIDPrefix}_episode_funding_header`}>
              {translate('Value-for-Value')}
            </Text>
          )}
          {hasValueInfo && !lnpayEnabled && (
            <View style={styles.noLnpayView}>
              <Text style={styles.noLnPayText}>{translate('Podcast supports value-for-value donations')}</Text>
              <Pressable
                accessibilityHint={translate('ARIA HINT - go to the Bitcoin wallet setup screen')}
                accessibilityLabel={translate('Setup Bitcoin Wallet')}
                accessibilityRole='button'
                style={styles.goToValueTagSetupButton} onPress={this._handleValueTagSetupPressed}>
                <Text
                  style={styles.goToValueTagSetupButtonText}>
                  {translate('Setup Bitcoin Wallet')}
                </Text>
              </Pressable>
            </View>
          )}
          {lnpayEnabled && hasValueInfo && (
            <View>
              <Text style={styles.textLabel} testID={`${testIDPrefix}_value_settings_lightning_label`}>
                {translate('Bitcoin Wallet')}
              </Text>
              <Text style={styles.textSubLabel} testID={`${testIDPrefix}_value_settings_lightning_sub_label`}>
                {translate('via your LNPay wallet')}
              </Text>
              <View style={styles.itemWrapper}>
                <TextInput
                  editable={false}
                  eyebrowTitle={translate('Boost Amount for this Podcast')}
                  keyboardType='numeric'
                  wrapperStyle={styles.textInput}
                  onBlur={() => {
                    // if (this.global.session.boostAmount < MINIMUM_BOOST_PAYMENT) {
                    //   this.setGlobal({ session: { ...session, boostAmount: MINIMUM_BOOST_PAYMENT } })
                    //   AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, String(MINIMUM_BOOST_PAYMENT))
                    // }
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  // onChangeText={(newText: string) => {
                  //   // this.setGlobal({ session: { ...session, boostAmount: Number(newText) } })
                  //   // AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, newText)
                  // }}
                  testID={`${testIDPrefix}_boost_amount_text_input`}
                  value={`${boostAmount}`}
                />
              </View>
              <View style={styles.valueTagInfoViewWrapper}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_boost_sample_label`}>
                  {translate('Boost splits')}
                </Text>
                <ValueTagInfoView
                  testID={testIDPrefix}
                  totalAmount={boostAmount}
                  transactions={boostTransactions}
                  erroringTransactions={erroringTransactions}
                />
              </View>
              <View style={styles.itemWrapper}>
                <TextInput
                  editable={false}
                  eyebrowTitle={translate('Streaming Amount for this Podcast')}
                  keyboardType='numeric'
                  wrapperStyle={styles.textInput}
                  onBlur={() => {
                    // if (this.global.session.boostAmount < MINIMUM_BOOST_PAYMENT) {
                    //   this.setGlobal({ session: { ...session, boostAmount: MINIMUM_BOOST_PAYMENT } })
                    //   AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, String(MINIMUM_BOOST_PAYMENT))
                    // }
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  // onChangeText={(newText: string) => {
                  //   // this.setGlobal({ session: { ...session, boostAmount: Number(newText) } })
                  //   // AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, newText)
                  // }}
                  testID={`${testIDPrefix}_boost_amount_text_input`}
                  value={`${streamingAmount}`}
                />
              </View>
              <View style={styles.valueTagInfoViewWrapper}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_streaming_sample_label`}>
                  {translate('Streaming splits per minute')}
                </Text>
                <ValueTagInfoView
                  testID={testIDPrefix}
                  totalAmount={streamingAmount}
                  transactions={streamingTransactions}
                  erroringTransactions={erroringTransactions}
                />
              </View>
            </View>
          )}
          {hasValueInfo && episodeLinks?.length > 0 && <Divider />}
          {episodeLinks?.length > 0 && (
            <View style={styles.fundingLinksWrapper}>
              <Text style={styles.textHeader} testID={`${testIDPrefix}_episode_funding_header`}>
                {translate('Episode Funding Links')}
              </Text>
              {episodeLinks}
            </View>
          )}
          {(hasValueInfo || episodeLinks?.length > 0) && podcastLinks?.length > 0 && <Divider style={styles.divider} />}
          {podcastLinks?.length > 0 && (
            <View style={styles.fundingLinksWrapper}>
              <Text
                // eslint-disable-next-line max-len
                accessibilityHint={translate('ARIA HINT - This section contains links to ways you can support this podcast')}
                accessibilityLabel={translate('Podcast Funding Links')}
                accessibilityRole='header'
                style={styles.textHeader}
                testID={`${testIDPrefix}_podcast_funding_header`}>
                {translate('Podcast Funding Links')}
              </Text>
              {podcastLinks}
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  divider: {
    marginVertical: 24
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.thin
  },
  fundingLink: {
    color: PV.Colors.linkColor,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginVertical: 12
  },
  fundingLinksWrapper: {
    marginTop: 0
  },
  image: {
    flex: 0,
    height: images.medium.height,
    marginRight: 12,
    width: images.medium.width
  },
  innerTopView: {
    flex: 0,
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 12
  },
  itemWrapper: {
    marginTop: 24
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-start'
  },
  pubDate: {
    color: PV.Colors.skyLight,
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    marginRight: 10,
    marginTop: 3
  },
  scrollViewContent: {
    paddingHorizontal: 12,
    paddingBottom: 64
  },
  text: {
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 24
  },
  textHeader: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  textInput: {
    marginVertical: 0
  },
  textLabel: {
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 16
  },
  textSubLabel: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 2
  },
  textTableLabel: {
    fontSize: PV.Fonts.sizes.xl,
    fontStyle: 'italic',
    marginBottom: 16
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  valueTagInfoViewWrapper: {},
  noLnpayView: {
    marginTop:10
  },
  noLnPayText: {
    fontSize: PV.Fonts.sizes.lg
  },
  goToValueTagSetupButton: {
    marginTop: 15
  },
  goToValueTagSetupButtonText: {
    fontSize: PV.Fonts.sizes.lg,
    color: PV.Colors.blueLighter,
    fontWeight: PV.Fonts.weights.bold
  }
})
