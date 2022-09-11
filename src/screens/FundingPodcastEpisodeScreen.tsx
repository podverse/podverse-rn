import { Funding, ValueTag } from 'podverse-shared'
import { Alert, Linking, Pressable, StyleSheet } from 'react-native'
import React from 'reactn'
import AsyncStorage from '@react-native-community/async-storage'
import {
  Divider,
  FastImage,
  Icon,
  NavDismissIcon,
  PressableWithOpacity,
  ScrollView,
  Text,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { BoostagramItem } from '../services/v4v/v4v'
import {
  v4vGetCurrentlyActiveProviderInfo
} from '../state/actions/v4v/v4v'
import { images } from '../styles'

type Props = any
type State = {}

const testIDPrefix = 'funding_podcast_episode_screen'

export class FundingPodcastEpisodeScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {}
  }

  static navigationOptions = ({ navigation }) => {

    return {
      headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      title: translate('Funding'),
      headerRight: null
    }
  }

  componentDidMount() {
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
    this.props.navigation.dismiss()
    if (consentGivenString && JSON.parse(consentGivenString) === true) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersScreen)
    } else {
      this.props.navigation.navigate(PV.RouteNames.V4VPreviewScreen)
    }
  }

  _fundingConvertToBoostagramItem = () => {
    const podcast = this.props.navigation.getParam('podcast')
    const episode = this.props.navigation.getParam('episode')

    let item = {} as BoostagramItem
    if (episode && podcast) {
      item = {
        episodeFunding: episode.funding || [],
        episodePubDate: episode.pubDate,
        episodeTitle: episode.title || '',
        episodeValue: episode.value || [],
        podcastFunding: podcast.funding || [],
        podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
        podcastTitle: podcast.title || '',
        podcastValue: podcast.value || []
      }
    } else if (podcast) {
      item = {
        podcastFunding: podcast.funding || [],
        podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
        podcastTitle: podcast.title || '',
        podcastValue: podcast.value || []
      }
    }

    return item
  }

  _handleBoostagramPress = () => {
    const { navigation } = this.props
    const podcast = this.props.navigation.getParam('podcast')
    const episode = this.props.navigation.getParam('episode')

    navigation.dismiss()
    navigation.navigate(PV.RouteNames.V4VBoostagramScreen, {
      podcast,
      episode
    })
  }

  render() {
    const boostagramItem = this._fundingConvertToBoostagramItem()
    const podcastFunding = boostagramItem?.podcastFunding || []
    const episodeFunding = boostagramItem?.episodeFunding || []

    const podcastLinks = podcastFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'podcast', index)
    )
    const episodeLinks = episodeFunding.map((item: any, index: number) =>
      this.renderFundingLink(item, 'episode', index)
    )

    const hasValueInfo =
      (boostagramItem?.episodeValue && boostagramItem.episodeValue.length > 0) ||
      (boostagramItem.podcastValue && boostagramItem?.podcastValue.length > 0)
    const { activeProvider } = v4vGetCurrentlyActiveProviderInfo(this.global)

    const podcastTitle = boostagramItem?.podcastTitle?.trim() || ''
    const episodeTitle = boostagramItem?.episodeTitle?.trim() || ''
    const pubDate = readableDate(boostagramItem?.episodePubDate)
    const headerAccessibilityLabel = `${podcastTitle}, ${episodeTitle}, ${pubDate}`

    return (
      <View style={styles.content} testID='funding_screen_view'>
        <View accessible accessibilityLabel={headerAccessibilityLabel} style={styles.innerTopView}>
          <FastImage isSmall source={boostagramItem.podcastShrunkImageUrl} styles={styles.image} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
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
            <View style={styles.boostagramButtonWrapper}>
              <PressableWithOpacity
                onPress={this._handleBoostagramPress}
                style={styles.boostagramButton}
                testID={'boostagram_button'.prependTestId()}>
                <Text style={styles.boostagramButtonMainText} testID='boost_button_text_1'>
                  {translate('Send Boostagram').toUpperCase()}
                </Text>
                <Icon
                  accessibilityLabel={translate('Send Boostagram')}
                  accessibilityRole='button'
                  name='comment-alt'
                  size={17}
                  testID={`${testIDPrefix}_boostagram_button`}
                />
              </PressableWithOpacity>
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
  boostagramButton: {
    flexDirection: 'row',
    margin: 10,
    height: 50,
    borderRadius: 35,
    backgroundColor: PV.Colors.velvet,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    textAlign: 'center'
  },
  boostagramButtonMainText: {
    fontSize: PV.Fonts.sizes.sm,
    marginRight: 8
  },
  boostagramButtonWrapper: {
    marginBottom: 8,
    marginTop: 6
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
