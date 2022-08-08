import { ValueTransaction } from 'podverse-shared'
import { Alert, Keyboard, Linking, Pressable, StyleSheet } from 'react-native'
import React, { getGlobal } from 'reactn'
import AsyncStorage from '@react-native-community/async-storage'
import {
  Divider,
  FastImage,
  NavDismissIcon,
  PressableWithOpacity,
  ScrollView,
  Text,
  TextInput,
  V4VRecipientsInfoView,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { convertValueTagIntoValueTransactions, v4vGetActiveValueTag } from '../services/v4v/v4v'
import { v4vGetCurrentlyActiveProviderInfo } from '../state/actions/v4v/v4v'
import { images } from '../styles'

type Props = any
type State = {
  boostTransactions: ValueTransaction[]
  streamingTransactions: ValueTransaction[]
}

const testIDPrefix = 'funding_screen'

export class FundingScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      boostTransactions: [],
      streamingTransactions: []
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
    const { player, podcastValueFinal } = this.global
    const { nowPlayingItem } = player

    const { activeProvider, activeProviderSettings } = v4vGetCurrentlyActiveProviderInfo(this.global)
    const { boostAmount, streamingAmount } = activeProviderSettings || {}
    
    const { episodeValue, podcastValue } = nowPlayingItem
    const valueTags =
      podcastValueFinal || (episodeValue?.length && episodeValue) || (podcastValue?.length && podcastValue)

    const activeValueTag = v4vGetActiveValueTag(
      valueTags, activeProvider?.type, activeProvider?.method)

    if (activeValueTag) {
      const roundDownBoostTransactions = true
      const roundDownStreamingTransactions = false
      const [boostTransactions, streamingTransactions] = await Promise.all([
        convertValueTagIntoValueTransactions(
          activeValueTag,
          nowPlayingItem,
          PV.V4V.ACTION_BOOST,
          boostAmount,
          roundDownBoostTransactions
        ),
        convertValueTagIntoValueTransactions(
          activeValueTag,
          nowPlayingItem,
          PV.V4V.ACTION_STREAMING,
          streamingAmount,
          roundDownStreamingTransactions
        )
      ])
      this.setState({ boostTransactions, streamingTransactions })
    }

    trackPageView('/funding', 'Funding Screen')
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
      <PressableWithOpacity activeOpacity={0.7} onPress={() => this.handleFollowLink(url)}>
        <Text
          key={`${testIDPrefix}-${type}-link-${index}`}
          style={styles.fundingLink}
          testID={`${testIDPrefix}_${type}_link_${index}`}>
          {value}
        </Text>
      </PressableWithOpacity>
    )
  }

  _handleV4VProvidersPressed = async () => {
    const consentGivenString = await AsyncStorage.getItem(PV.Keys.USER_CONSENT_VALUE_TAG_TERMS)
    if (consentGivenString && JSON.parse(consentGivenString) === true) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersScreen)
    } else {
      this.props.navigation.navigate(PV.RouteNames.V4VPreviewScreen)
    }
  }

  render() {
    const { boostTransactions, streamingTransactions } = this.state
    const { player, podcastValueFinal, session } = this.global
    const { v4v } = session
    const { previousTransactionErrors, providers } = v4v
    const { active } = providers
    const { nowPlayingItem } = player
    const podcastFunding = nowPlayingItem?.podcastFunding || []
    const episodeFunding = nowPlayingItem?.episodeFunding || []
    
    const { activeProviderSettings } = v4vGetCurrentlyActiveProviderInfo(this.global)
    const { boostAmount, streamingAmount } = activeProviderSettings || {}   

    const podcastLinks = podcastFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'podcast', index)
    )
    const episodeLinks = episodeFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'episode', index)
    )
    const hasValueInfo =
      (podcastValueFinal?.length > 0 ||
        nowPlayingItem?.episodeValue?.length > 0 ||
        nowPlayingItem?.podcastValue?.length > 0)

    const hasActiveProvider = !!active

    const podcastTitle = nowPlayingItem?.podcastTitle.trim() || translate('Untitled Podcast')
    const episodeTitle = nowPlayingItem?.episodeTitle.trim() || translate('Untitled Episode')
    const pubDate = readableDate(nowPlayingItem.episodePubDate)
    const headerAccessibilityLabel = `${podcastTitle}, ${episodeTitle}, ${pubDate}`

    return (
      <View style={styles.content} testID='funding_screen_view'>
        <View accessible accessibilityLabel={headerAccessibilityLabel} style={styles.innerTopView}>
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
              accessibilityHint={translate(
                'ARIA HINT - This section provides the value-for-value information for this podcast'
              )}
              accessibilityLabel={translate('Value-for-Value')}
              accessibilityRole='header'
              style={styles.textHeader}
              testID={`${testIDPrefix}_episode_funding_header`}>
              {translate('Value-for-Value')}
            </Text>
          )}
          {hasValueInfo && !hasActiveProvider && (
            <View style={styles.noV4VView}>
              <Text style={styles.noV4VText}>{translate('Podcast supports value-for-value donations')}</Text>
              <Pressable
                accessibilityHint={translate('ARIA HINT - go to the Bitcoin wallet setup screen')}
                accessibilityLabel={translate('Setup Wallet')}
                accessibilityRole='button'
                style={styles.goToV4VProvidersButton}
                onPress={this._handleV4VProvidersPressed}>
                <Text style={styles.goToV4VProvidersButtonText}>{translate('Setup Wallet')}</Text>
              </Pressable>
            </View>
          )}
          {hasActiveProvider && hasValueInfo && (
            <View>
              <Text style={styles.textLabel} testID={`${testIDPrefix}_value_settings_lightning_label`}>
                {translate('Value for Value')}
              </Text>
              {/* <Text style={styles.textSubLabel} testID={`${testIDPrefix}_value_settings_lightning_sub_label`}>
                some wallet text here
              </Text> */}
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
              <View style={styles.V4VRecipientsInfoView}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_boost_sample_label`}>
                  {translate('Boost splits')}
                </Text>
                <V4VRecipientsInfoView
                  testID={testIDPrefix}
                  totalAmount={boostAmount}
                  transactions={boostTransactions}
                  erroringTransactions={previousTransactionErrors.boost}
                />
              </View>
              <View style={styles.itemWrapper}>
                <TextInput
                  editable={false}
                  eyebrowTitle={translate('Streaming Amount for this podcast')}
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
              <View style={styles.V4VRecipientsInfoView}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_streaming_sample_label`}>
                  {translate('Streaming splits per minute')}
                </Text>
                <V4VRecipientsInfoView
                  testID={testIDPrefix}
                  totalAmount={streamingAmount}
                  transactions={streamingTransactions}
                  erroringTransactions={previousTransactionErrors.streaming}
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
                accessibilityHint={translate(
                  'ARIA HINT - This section contains links to ways you can support this podcast'
                )}
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
    marginBottom: 8,
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
  V4VRecipientsInfoView: {},
  noV4VView: {
    marginTop: 10
  },
  noV4VText: {
    fontSize: PV.Fonts.sizes.lg
  },
  goToV4VProvidersButton: {
    marginTop: 15
  },
  goToV4VProvidersButtonText: {
    fontSize: PV.Fonts.sizes.lg,
    color: PV.Colors.blueLighter,
    fontWeight: PV.Fonts.weights.bold
  }
})
