import { ValueTransaction } from 'podverse-shared'
import { Dimensions, Keyboard, StyleSheet } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { getGlobal } from 'reactn'
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
import { trackPageView } from '../services/tracking'
import {
  convertValueTagIntoValueTransactions,
  MINIMUM_BOOST_PAYMENT,
  sendBoost,
  v4vGetActiveValueTag,
  v4vGetTypeMethodKey
} from '../services/v4v/v4v'
import {
  v4vClearBoostagramMessage,
  v4vGetCurrentlyActiveProviderInfo,
  V4VTypeMethod,
  v4vUpdateBoostagramMessage,
  v4vUpdateTypeMethodSettingsBoostAmount
} from '../state/actions/v4v/v4v'
import { images } from '../styles'

type Props = any
type State = {
  boostIsSending: boolean
  boostTransactions: ValueTransaction[]
  boostWasSent: boolean
  explosionOrigin: number
  localBoostAmount: string
  localAppBoostAmount: string
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
      explosionOrigin: 0,
      localBoostAmount: '0',
      localAppBoostAmount: '0'
    }
  }

  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()

    return {
      title: translate('Boostagram'),
      headerLeft: () => (
        <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />
      ),
      headerRight: null
    }
  }

  componentDidMount() {
    const { player, podcastValueFinal } = this.global
    const { nowPlayingItem } = player

    const { activeProvider } = v4vGetCurrentlyActiveProviderInfo(this.global)

    const { episodeValue, podcastValue } = nowPlayingItem
    const valueTags =
      podcastValueFinal || (episodeValue?.length && episodeValue) || (podcastValue?.length && podcastValue)
    const activeValueTag = v4vGetActiveValueTag(valueTags, activeProvider?.type, activeProvider?.method)

    if (activeValueTag && activeProvider) {
      const { method, type } = activeProvider
      const typeMethodKey = v4vGetTypeMethodKey(type, method)
      const typeMethodSettings = this.global.session.v4v.settings.typeMethod[typeMethodKey] as V4VTypeMethod

      this.setState(
        {
          localBoostAmount: typeMethodSettings.boostAmount?.toString(),
          localAppBoostAmount: typeMethodSettings.appBoostAmount?.toString()
        },
        () => {
          this._handleUpdateBoostTransactionsState(PV.V4V.ACTION_BOOST, typeMethodSettings.boostAmount)
        }
      )
    }

    trackPageView('/v4v/boostagram', 'V4V - Boostagram Screen')
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
    const { player, podcastValueFinal } = this.global
    const { nowPlayingItem } = player
    const { activeProvider } = v4vGetCurrentlyActiveProviderInfo(this.global)

    const valueTags =
      podcastValueFinal ||
      (nowPlayingItem?.episodeValue?.length && nowPlayingItem?.episodeValue) ||
      (nowPlayingItem?.podcastValue?.length && nowPlayingItem?.podcastValue)
    const activeValueTag = v4vGetActiveValueTag(valueTags, activeProvider?.type, activeProvider?.method)

    if (activeValueTag) {
      let shouldRound = false
      if (action === PV.V4V.ACTION_BOOST) {
        shouldRound = true
      }

      const newValueTransactions = await convertValueTagIntoValueTransactions(
        activeValueTag,
        nowPlayingItem,
        action,
        amount,
        shouldRound
      )

      this.setState({ boostTransactions: newValueTransactions })
    }
  }

  _attemptBoostagram = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', PV.Haptic.options)
    this.setState({ boostIsSending: true }, () => {
      (async () => {
        const { podcastValueFinal } = this.global
        const { nowPlayingItem } = this.global.player
        const includeMessage = true
        await sendBoost(nowPlayingItem, podcastValueFinal, includeMessage)
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
      boostIsSending,
      boostTransactions,
      boostWasSent,
      explosionOrigin,
      // localAppBoostAmount,
      localBoostAmount
    } = this.state
    const { player, podcastValueFinal, session } = this.global
    const { v4v } = session
    const { boostagramMessage, previousTransactionErrors } = v4v
    const { nowPlayingItem } = player

    const hasValueInfo =
      podcastValueFinal?.length > 0 ||
      nowPlayingItem?.episodeValue?.length > 0 ||
      nowPlayingItem?.podcastValue?.length > 0
    const { activeProvider, activeProviderSettings } = v4vGetCurrentlyActiveProviderInfo(this.global)

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
          {!!activeProvider && hasValueInfo && (
            <View>
              {
                !boostWasSent && (
                  <>
                    <View style={styles.itemWrapper}>
                      <TextInput
                        editable
                        eyebrowTitle={translate('Boost Amount for this Podcast')}
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
                    <View style={styles.itemWrapper}>
                      <TextInput
                        editable
                        eyebrowTitle={translate('Message')}
                        keyboardType='default'
                        wrapperStyle={styles.textInput}
                        numberOfLines={4}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        onChangeText={(newText: string) => {
                          v4vUpdateBoostagramMessage(newText)
                        }}
                        placeholder={translate('Message optional')}
                        testID={`${testIDPrefix}_message_text_input`}
                        value={boostagramMessage}
                      />
                    </View>
                    <View style={styles.boostagramButtonWrapper}>
                      <Button
                        accessibilityLabel={translate('Send')}
                        disabled={boostIsSending}
                        isLoading={boostIsSending}
                        isSuccess
                        onPress={this._attemptBoostagram}
                        testID={`${testIDPrefix}_send_boostagram`}
                        text={translate('Send')}
                        wrapperStyles={styles.boostagramButton}
                      />
                    </View>
                    <Divider />
                  </>
                )
              }
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
            </View>
          )}
        </ScrollView>
        {
          <ConfettiCannon
            count={200}
            explosionSpeed={500}
            origin={{ x: Dimensions.get('screen').width, y: explosionOrigin }}
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
    flex: 1,
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
  V4VRecipientsInfoView: {
    marginTop: 24
  }
})
