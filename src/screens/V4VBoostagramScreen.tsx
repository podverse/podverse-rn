import debounce from 'lodash/debounce'
import { ValueTag, ValueTransaction } from 'podverse-shared'
import { Keyboard, StyleSheet } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React from 'reactn'
import AsyncStorage from '@react-native-community/async-storage'
import {
  Button,
  Divider,
  FastImage,
  NavDismissIcon,
  ScrollView,
  Text,
  TextInput,
  V4VRecipientsInfoView,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { playerGetPosition } from '../services/player'
import { trackPageView } from '../services/tracking'
import {
  BoostagramItem,
  convertValueTagIntoValueTransactions,
  extractV4VValueTags,
  MINIMUM_BOOST_PAYMENT,
  sendBoost,
  v4vGetActiveValueTag,
  v4vGetPluralCurrencyUnit,
  v4vGetSatoshisInFormattedFiatValue,
  v4vGetTypeMethodKey
} from '../services/v4v/v4v'
import {
  getBoostagramItemValueTags,
  v4vClearBoostagramMessage,
  v4vGetActiveProviderInfo,
  V4VTypeMethod,
  v4vUpdateBoostagramMessage,
  v4vUpdateTypeMethodSettingsBoostAmount
} from '../state/actions/v4v/v4v'
import { core, images } from '../styles'

type Props = any
type State = {
  activeValueTag?: ValueTag
  boostIsSending: boolean
  boostTransactions: ValueTransaction[]
  boostWasSent: boolean
  defaultMessage: string
  explosionOrigin: number
  localBoostAmount: number
  localAppBoostAmount: number
  playerPositionState: number
}

const testIDPrefix = 'boostagram_screen'

export class V4VBoostagramScreen extends React.Component<Props, State> {
  explosion: ConfettiCannon | null

  constructor() {
    super()
    this.state = {
      boostIsSending: false,
      boostTransactions: [],
      boostWasSent: false,
      defaultMessage: '',
      explosionOrigin: 0,
      localBoostAmount: 0,
      localAppBoostAmount: 0,
      playerPositionState: 0
    }
  }

  static navigationOptions = ({ navigation }) => {
    const showBackButton = navigation.getParam('showBackButton')
    return {
      ...(!!showBackButton
        ? {}
        : {
            headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />
          }),
      title: translate('Boostagram'),
      headerRight: null
    }
  }

  async componentDidMount() {
    const boostagramItem = this._convertToBoostagramItem()
    const playerPositionState = await playerGetPosition()

    const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(boostagramItem))

    const { episodeValue, podcastValue } = boostagramItem
    const valueTags = extractV4VValueTags(episodeValue, podcastValue)
    const activeValueTag = v4vGetActiveValueTag(
      valueTags, playerPositionState, activeProvider?.type, activeProvider?.method)

    if (activeValueTag && activeProvider) {
      const { method, type } = activeProvider
      const typeMethodKey = v4vGetTypeMethodKey(type, method)
      const typeMethodSettings = this.global.session.v4v.settings.typeMethod[typeMethodKey] as V4VTypeMethod
      const defaultMessage = this.global.session.v4v.boostagramMessage || ''

      this.setState(
        {
          activeValueTag,
          defaultMessage,
          localBoostAmount: typeMethodSettings.boostAmount,
          localAppBoostAmount: typeMethodSettings.appBoostAmount,
          playerPositionState
        },
        () => {
          this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, typeMethodSettings.boostAmount)
        }
      )
    }

    this._handleBoostagramMessageTextUpdate = debounce(this._handleBoostagramMessageTextUpdate, 200, {
      leading: false,
      maxWait: 200,
      trailing: true
    })

    trackPageView('/v4v/boostagram', 'V4V - Boostagram Screen')
  }

  _convertToBoostagramItem = () => {
    const { player } = this.global
    const { nowPlayingItem } = player
    const podcast = this.props.navigation.getParam('podcast')
    const episode = this.props.navigation.getParam('episode')

    let item = {} as BoostagramItem
    if (episode && podcast) {
      item = {
        episodeFunding: episode.funding || [],
        episodeGuid: episode.guid || '',
        episodePubDate: episode.pubDate,
        episodeTitle: episode.title || '',
        episodeValue: episode.value || [],
        podcastFunding: podcast.funding || [],
        podcastIndexPodcastId: podcast.podcastIndexId || '',
        podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
        podcastTitle: podcast.title || '',
        podcastValue: podcast.value || []
      }
    } else if (podcast) {
      item = {
        podcastFunding: podcast.funding || [],
        podcastIndexPodcastId: podcast.podcastIndexId || '',
        podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
        podcastTitle: podcast.title || '',
        podcastValue: podcast.value || []
      }
    } else if (nowPlayingItem) {
      item = {
        episodeFunding: nowPlayingItem.episodeFunding || [],
        episodeGuid: nowPlayingItem.episodeGuid || '',
        episodePubDate: (nowPlayingItem.episodePubDate as any) || new Date(),
        episodeTitle: nowPlayingItem.episodeTitle || '',
        episodeValue: nowPlayingItem.episodeValue || [],
        podcastFunding: nowPlayingItem.podcastFunding || [],
        podcastIndexPodcastId: nowPlayingItem.podcastIndexPodcastId || '',
        podcastShrunkImageUrl: nowPlayingItem.podcastShrunkImageUrl || nowPlayingItem.podcastImageUrl || '',
        podcastTitle: nowPlayingItem.podcastTitle || '',
        podcastValue: nowPlayingItem.podcastValue || []
      }
    }

    return item
  }

  _handleV4VProvidersPressed = async () => {
    const consentGivenString = await AsyncStorage.getItem(PV.Keys.USER_CONSENT_VALUE_TAG_TERMS)
    if (consentGivenString && JSON.parse(consentGivenString) === true) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersScreen)
    } else {
      this.props.navigation.navigate(PV.RouteNames.V4VPreviewScreen)
    }
  }

  _handleUpdateBoostTransactionsState = async (action: 'ACTION_BOOST', amount: number) => {
    const { activeValueTag } = this.state
    const boostagramItem = this._convertToBoostagramItem()
    const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(boostagramItem))

    if (activeValueTag && activeProvider?.key) {
      let shouldRound = false
      if (action === PV.V4V.ACTION_BOOST) {
        shouldRound = true
      }

      const newValueTransactions = await convertValueTagIntoValueTransactions(
        activeValueTag,
        boostagramItem.podcastTitle || '',
        boostagramItem.episodeTitle || '',
        boostagramItem.podcastIndexPodcastId || '',
        action,
        amount,
        shouldRound,
        activeProvider.key,
        boostagramItem.episodeGuid ||  ''
      )

      this.setState({ boostTransactions: newValueTransactions })
    }
  }

  _handleBoostagramMessageTextUpdate = (newText: string) => {
    v4vUpdateBoostagramMessage(newText)
  }

  _attemptBoostagram = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', PV.Haptic.options)
    this.setState({ boostIsSending: true }, () => {
      (async () => {
        const { playerPositionState } = this.state
        const boostagramItem = this._convertToBoostagramItem()
        const includeMessage = true
        await sendBoost(boostagramItem, playerPositionState, includeMessage)
        this.setState(
          {
            boostIsSending: false,
            boostWasSent: true
          },
          () => {
            this.explosion && this.explosion.start()
            v4vClearBoostagramMessage()
          }
        )
      })()
    })
  }

  render() {
    const {
      activeValueTag,
      boostIsSending,
      boostTransactions,
      boostWasSent,
      defaultMessage,
      explosionOrigin,
      // localAppBoostAmount,
      localBoostAmount
    } = this.state
    const { screen, session } = this.global
    const { screenWidth } = screen
    const { v4v } = session
    const { boostagramMessage, previousTransactionErrors } = v4v
    const boostagramItem = this._convertToBoostagramItem()

    const hasValueInfo =
      (boostagramItem?.episodeValue && boostagramItem?.episodeValue.length > 0) ||
      (boostagramItem?.podcastValue && boostagramItem?.podcastValue?.length > 0)
    const { activeProvider, activeProviderSettings } = v4vGetActiveProviderInfo(
      getBoostagramItemValueTags(boostagramItem)
    )

    const boostFiatAmountText = activeProvider
      ? v4vGetSatoshisInFormattedFiatValue({
          btcRateInFiat: activeProvider.fiat_rate_float,
          satoshiAmount: localBoostAmount,
          currency: activeProvider.fiat_currency
        })
      : ''

    const podcastTitle = boostagramItem?.podcastTitle?.trim() || translate('Untitled Podcast')
    const episodeTitle = boostagramItem?.episodeTitle?.trim()
    const pubDate = readableDate(boostagramItem.episodePubDate)
    const headerAccessibilityLabel = `${podcastTitle}, ${episodeTitle}, ${pubDate}`

    const boostagramMessageCharCount = boostagramMessage?.length || 0
    const boostagramCharLimit = activeProviderSettings?.boostagramCharLimit || 500
    const boostagramMessageIsValid = boostagramMessageCharCount <= boostagramCharLimit
    const sendButtonDisabled = boostIsSending || !boostagramMessageIsValid

    const boostAmountLabelText = activeProvider?.unit
      ? `${translate('Boost Amount')} (${v4vGetPluralCurrencyUnit(activeProvider.unit)})`
      : ''

    return (
      <View style={styles.content} testID='funding_screen_view'>
        <View accessible accessibilityLabel={headerAccessibilityLabel} style={styles.innerTopView}>
          <FastImage isSmall source={boostagramItem?.podcastShrunkImageUrl} styles={styles.image} />
          <View style={{ justifyContent: 'center', flex: 1 }}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testIDPrefix}_podcast_title`}>
              {podcastTitle}
            </Text>
            {!!episodeTitle && (
              <>
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
              </>
            )}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {!!activeProvider && hasValueInfo && (
            <View>
              {!boostWasSent && (
                <>
                  <View style={styles.itemWrapper}>
                    <TextInput
                      editable
                      eyebrowTitle={boostAmountLabelText}
                      keyboardType='numeric'
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
                            await v4vUpdateTypeMethodSettingsBoostAmount(
                              this.global,
                              type,
                              method,
                              MINIMUM_BOOST_PAYMENT
                            )
                            this.setState({ localBoostAmount: MINIMUM_BOOST_PAYMENT })
                            this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, MINIMUM_BOOST_PAYMENT)
                          }
                        }
                      }}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onChangeText={(newNumber: number) => {
                        this.setState({ localBoostAmount: newNumber })
                      }}
                      outerWrapperStyle={styles.textInputWrapperOuter}
                      subText={!!boostFiatAmountText ? `${boostFiatAmountText}*` : ''}
                      subTextAlignRight
                      testID={`${testIDPrefix}_boost_amount_text_input`}
                      value={localBoostAmount?.toString() || ''}
                    />
                  </View>
                  <View style={styles.itemWrapper}>
                    <TextInput
                      defaultValue={defaultMessage}
                      editable
                      eyebrowTitle={translate('Message')}
                      keyboardType='default'
                      numberOfLines={4}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onChangeText={(newText: string) => {
                        this._handleBoostagramMessageTextUpdate(newText)
                      }}
                      outerWrapperStyle={styles.textInputWrapperOuter}
                      placeholder={translate('Message optional')}
                      style={styles.textInput}
                      testID={`${testIDPrefix}_message_text_input`}
                    />
                  </View>
                  <Text style={styles.charCounter}>{`${boostagramMessageCharCount} / ${boostagramCharLimit}`}</Text>
                  <View style={styles.boostagramButtonWrapper}>
                    <Button
                      accessibilityLabel={translate('Send')}
                      disabled={sendButtonDisabled}
                      isLoading={boostIsSending}
                      isSuccess={!sendButtonDisabled}
                      onPress={this._attemptBoostagram}
                      testID={`${testIDPrefix}_send_boostagram`}
                      text={translate('Send')}
                      wrapperStyles={styles.boostagramButton}
                    />
                  </View>
                  <Divider />
                </>
              )}
              <View style={styles.V4VRecipientsInfoView}>
                {boostWasSent && <Text style={styles.boostSentText}>{`${translate('Boost Sent')} ⚡️`}</Text>}
                <Text
                  style={styles.textTableLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_boost_sample_label`}>
                  {translate('Boost splits')}
                </Text>
                <V4VRecipientsInfoView
                  activeValueTag={activeValueTag}
                  testID={`${testIDPrefix}_boost`}
                  totalAmount={activeProviderSettings?.boostAmount || 0}
                  transactions={boostTransactions}
                  erroringTransactions={previousTransactionErrors.boost}
                />
              </View>
              <Text style={core.footnote}>{`*${translate('Satoshi to fiat conversion by Alby API')}`}</Text>
            </View>
          )}
        </ScrollView>
        {
          <ConfettiCannon
            count={200}
            explosionSpeed={500}
            origin={{ x: screenWidth, y: explosionOrigin }}
            autoStart={false}
            ref={(ref) => (this.explosion = ref)}
            fadeOut
          />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  boostagramButton: {
    marginTop: 26,
    marginBottom: 44,
    minWidth: '50%'
  },
  boostagramButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  boostSentText: {
    marginBottom: 48,
    marginTop: 16,
    fontSize: PV.Fonts.sizes.huge,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center'
  },
  charCounter: {
    fontSize: PV.Fonts.sizes.sm,
    textAlign: 'right'
  },
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
  image: {
    flex: 0,
    height: images.medium.height,
    marginRight: 12,
    width: images.medium.width
  },
  innerTopView: {
    flex: 0,
    flexDirection: 'row',
    marginBottom: 8,
    marginTop: 16,
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
  textInput: {
    minHeight: '0%',
    paddingBottom: 12,
    paddingTop: 12
  },
  textInputWrapperOuter: {
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
  V4VRecipientsInfoView: {
    marginTop: 24
  }
})
