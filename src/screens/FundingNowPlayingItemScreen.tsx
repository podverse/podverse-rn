import { ValueTransaction } from 'podverse-shared'
import { Alert, Keyboard, Linking, Pressable, StyleSheet } from 'react-native'
import React from 'reactn'
import AsyncStorage from '@react-native-community/async-storage'
import {
  Divider,
  FastImage,
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
import {
  convertValueTagIntoValueTransactions,
  extractV4VValueTags,
  MINIMUM_BOOST_PAYMENT,
  MINIMUM_STREAMING_PAYMENT,
  v4vGetActiveValueTag,
  v4vGetPluralCurrencyUnit,
  v4vGetTypeMethodKey
} from '../services/v4v/v4v'
import {
  getBoostagramItemValueTags,
  v4vGetActiveProviderInfo,
  V4VTypeMethod,
  v4vUpdateTypeMethodSettingsBoostAmount,
  v4vUpdateTypeMethodSettingsStreamingAmount
} from '../state/actions/v4v/v4v'
import { images } from '../styles'

type Props = any
type State = {
  boostTransactions: ValueTransaction[]
  streamingTransactions: ValueTransaction[]
  localBoostAmount: string
  localStreamingAmount: string
  localAppBoostAmount: string
  localAppStreamingAmount: string
}

const testIDPrefix = 'funding_screen'

export class FundingNowPlayingItemScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      boostTransactions: [],
      streamingTransactions: [],
      localBoostAmount: '0',
      localStreamingAmount: '0',
      localAppBoostAmount: '0',
      localAppStreamingAmount: '0'
    }
  }

  static navigationOptions = () => {
    return {
      title: translate('Funding'),
      headerRight: null
    }
  }

  componentDidMount() {
    const { player } = this.global
    const { nowPlayingItem } = player

    const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(nowPlayingItem))

    const { episodeValue, podcastValue } = nowPlayingItem
    const valueTags = extractV4VValueTags(episodeValue, podcastValue)
    const activeValueTag = v4vGetActiveValueTag(valueTags, activeProvider?.type, activeProvider?.method)

    if (activeValueTag && activeProvider) {
      const { method, type } = activeProvider
      const typeMethodKey = v4vGetTypeMethodKey(type, method)
      const typeMethodSettings = this.global.session.v4v.settings.typeMethod[typeMethodKey] as V4VTypeMethod

      this.setState(
        {
          localBoostAmount: typeMethodSettings.boostAmount?.toString(),
          localStreamingAmount: typeMethodSettings.streamingAmount?.toString(),
          localAppBoostAmount: typeMethodSettings.appBoostAmount?.toString(),
          localAppStreamingAmount: typeMethodSettings.appStreamingAmount?.toString()
        },
        () => {
          Promise.all([
            this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, typeMethodSettings.boostAmount),
            this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_STREAMING, typeMethodSettings.streamingAmount)
          ])
        }
      )
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
      <PressableWithOpacity
        activeOpacity={0.7}
        key={`${testIDPrefix}-${type}-link-button-${index}`}
        onPress={() => this.handleFollowLink(url)}>
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

  _handleUpdateBoostTransactionsState = async (action: 'ACTION_BOOST' | 'ACTION_STREAMING', amount: number) => {
    const { player } = this.global
    const { nowPlayingItem } = player
    const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(nowPlayingItem))

    const valueTags =
      (nowPlayingItem?.episodeValue?.length && nowPlayingItem?.episodeValue) ||
      (nowPlayingItem?.podcastValue?.length && nowPlayingItem?.podcastValue)
    const activeValueTag = v4vGetActiveValueTag(valueTags, activeProvider?.type, activeProvider?.method)

    if (activeValueTag && activeProvider?.key) {
      let shouldRound = false
      if (action === PV.V4V.ACTION_BOOST) {
        shouldRound = true
      }

      const newValueTransactions = await convertValueTagIntoValueTransactions(
        activeValueTag,
        nowPlayingItem.podcastTitle || '',
        nowPlayingItem.episodeTitle || '',
        nowPlayingItem.podcastIndexPodcastId || '',
        action,
        amount,
        shouldRound,
        activeProvider.key
      )

      if (action === 'ACTION_BOOST') {
        this.setState({ boostTransactions: newValueTransactions })
      } else if (action === 'ACTION_STREAMING') {
        this.setState({ streamingTransactions: newValueTransactions })
      }
    }
  }

  render() {
    const {
      boostTransactions,
      // localAppBoostAmount,
      // localAppStreamingAmount,
      localBoostAmount,
      localStreamingAmount,
      streamingTransactions
    } = this.state
    const { player, session } = this.global
    const { v4v } = session
    const { previousTransactionErrors } = v4v
    const { nowPlayingItem } = player
    const podcastFunding = nowPlayingItem?.podcastFunding || []
    const episodeFunding = nowPlayingItem?.episodeFunding || []

    const podcastLinks = podcastFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'podcast', index)
    )
    const episodeLinks = episodeFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'episode', index)
    )

    const hasValueInfo = nowPlayingItem?.episodeValue?.length > 0 || nowPlayingItem?.podcastValue?.length > 0
    const { activeProvider, activeProviderSettings } = v4vGetActiveProviderInfo(
      getBoostagramItemValueTags(nowPlayingItem)
    )

    const podcastTitle = nowPlayingItem?.podcastTitle?.trim() || translate('Untitled Podcast')
    const episodeTitle = nowPlayingItem?.episodeTitle?.trim() || translate('Untitled Episode')

    let pubDate = ''
    if (nowPlayingItem?.liveItem?.start) {
      pubDate = readableDate(nowPlayingItem?.liveItem?.start)
    } else if (nowPlayingItem?.episodePubDate) {
      pubDate = readableDate(nowPlayingItem?.episodePubDate)
    }

    const headerAccessibilityLabel = `${podcastTitle}, ${episodeTitle}, ${pubDate}`

    const boostAmountLabelText = activeProvider?.unit
      ? `${translate('Boost Amount')} (${v4vGetPluralCurrencyUnit(activeProvider.unit)})`
      : ''

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
              {!!pubDate && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary
                  style={styles.pubDate}
                  testID={`${testIDPrefix}_pub_date`}>
                  {pubDate}
                </Text>
              )}
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
              {translate('Value for Value')}
            </Text>
          )}
          {hasValueInfo && !activeProvider && (
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
          {!!activeProvider && hasValueInfo && (
            <View>
              {/* <Text style={styles.textSubLabel} testID={`${testIDPrefix}_value_settings_lightning_sub_label`}>
                some wallet text here
              </Text> */}
              <View style={styles.itemWrapper}>
                <TextInput
                  editable
                  eyebrowTitle={boostAmountLabelText}
                  keyboardType='numeric'
                  wrapperStyle={styles.textInput}
                  onBlur={async () => {
                    const { localBoostAmount } = this.state
                    if (activeProvider) {
                      const { type, method } = activeProvider
                      if (Number(localBoostAmount) && Number(localBoostAmount) > MINIMUM_BOOST_PAYMENT) {
                        await v4vUpdateTypeMethodSettingsBoostAmount(
                          this.global,
                          type,
                          method,
                          Number(localBoostAmount)
                        )
                        this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, Number(localBoostAmount))
                      } else {
                        await v4vUpdateTypeMethodSettingsBoostAmount(this.global, type, method, MINIMUM_BOOST_PAYMENT)
                        this.setState({ localBoostAmount: MINIMUM_BOOST_PAYMENT.toString() })
                        this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, MINIMUM_BOOST_PAYMENT)
                      }
                    }
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(newText: string) => {
                    this.setState({ localBoostAmount: newText })
                  }}
                  testID={`${testIDPrefix}_boost_amount_text_input`}
                  value={localBoostAmount}
                />
              </View>
              <View style={styles.V4VRecipientsInfoView}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_boost_sample_label`}>
                  {translate('Boost splits')}
                </Text>
                <V4VRecipientsInfoView
                  testID={`${testIDPrefix}_boost`}
                  totalAmount={activeProviderSettings?.boostAmount || 0}
                  transactions={boostTransactions}
                  erroringTransactions={previousTransactionErrors.boost}
                />
              </View>
              <View style={styles.itemWrapper}>
                <TextInput
                  editable
                  eyebrowTitle={translate('Streaming Amount for this podcast')}
                  keyboardType='numeric'
                  wrapperStyle={styles.textInput}
                  onBlur={async () => {
                    const { localStreamingAmount } = this.state
                    if (activeProvider) {
                      const { type, method } = activeProvider
                      if (Number(localStreamingAmount) && Number(localStreamingAmount) > MINIMUM_STREAMING_PAYMENT) {
                        await v4vUpdateTypeMethodSettingsStreamingAmount(
                          this.global,
                          type,
                          method,
                          Number(localStreamingAmount)
                        )
                        this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_STREAMING, Number(localStreamingAmount))
                      } else {
                        await v4vUpdateTypeMethodSettingsStreamingAmount(
                          this.global,
                          type,
                          method,
                          MINIMUM_STREAMING_PAYMENT
                        )
                        this.setState({ localStreamingAmount: MINIMUM_STREAMING_PAYMENT.toString() })
                        this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_STREAMING, MINIMUM_STREAMING_PAYMENT)
                      }
                    }
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(newText: string) => {
                    this.setState({ localStreamingAmount: newText })
                  }}
                  testID={`${testIDPrefix}_streaming_amount_text_input`}
                  value={localStreamingAmount}
                />
              </View>
              <View style={styles.V4VRecipientsInfoView}>
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_streaming_sample_label`}>
                  {translate('Streaming splits per minute')}
                </Text>
                <V4VRecipientsInfoView
                  testID={`${testIDPrefix}_streaming`}
                  totalAmount={activeProviderSettings?.streamingAmount || 0}
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
