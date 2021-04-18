import { ValueTransaction } from 'podverse-shared'
import { Alert, Linking, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import React, { getGlobal } from 'reactn'
import { Divider, FastImage, NavDismissIcon, ScrollView, Text, ValueTagInfoView, View } from '../components'
import { translate } from '../lib/i18n'
import { readableDate, testProps } from '../lib/utility'
import { convertValueTagIntoValueTransactions } from '../lib/valueTagHelpers'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

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
    const { player, session } = this.global
    const { nowPlayingItem } = player
    const { boostAmount, streamingAmount } = session

    const { episodeValue, podcastValue } = nowPlayingItem
    const valueTags = episodeValue || podcastValue
    // TODO: right now we are assuming the first item will be the lightning network.
    // This will need to be updated to support additional valueTags.
    const valueTag = valueTags[0]
    const boostTransactions = await convertValueTagIntoValueTransactions(
        valueTag, nowPlayingItem, PV.ValueTag.ACTION_BOOST, boostAmount)
    const streamingTransactions = await convertValueTagIntoValueTransactions(
        valueTag, nowPlayingItem, PV.ValueTag.ACTION_STREAMING, streamingAmount)
    this.setState({ boostTransactions, streamingTransactions })

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
      <TouchableOpacity activeOpacity={0.7} onPress={() => this.handleFollowLink(url)}>
        <Text
          key={`${testIDPrefix}-${type}-link-${index}`}
          style={styles.fundingLink}
          testID={`${testIDPrefix}_${type}_link_${index}`}>
          {value}
        </Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { boostTransactions, streamingTransactions } = this.state
    const { nowPlayingItem } = this.global.player
    const { episodeFunding, episodeValue, podcastFunding, podcastValue } = nowPlayingItem

    const podcastLinks = podcastFunding?.map((item: any, index: number) =>
      this.renderFundingLink(item, 'podcast', index))
    const episodeLinks = episodeFunding?.map((item: any, index: number) =>
      this.renderFundingLink(item, 'episode', index))
    const hasValueInfo = episodeValue?.length > 0 || podcastValue?.length > 0

    return (
      <View style={styles.content} {...testProps('funding_screen_view')}>
        <View style={styles.innerTopView}>
          <FastImage isSmall source={nowPlayingItem.podcastShrunkImageUrl} styles={styles.image} />
          <View>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testIDPrefix}_podcast_title`}>
              {nowPlayingItem?.podcastTitle.trim() || translate('Untitled Podcast')}
            </Text>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={styles.episodeTitle}
              testID={`${testIDPrefix}_episode_title`}>
              {nowPlayingItem?.episodeTitle.trim() || translate('Untitled Episode')}
            </Text>
            <View style={styles.textWrapperBottomRow}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary
                style={styles.pubDate}
                testID={`${testIDPrefix}_pub_date`}>
                {readableDate(nowPlayingItem.episodePubDate)}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {
            hasValueInfo &&
              <View>
                <Text
                  style={styles.textHeader}
                  testID={`${testIDPrefix}_value_settings_header`}>
                  {translate('Value Settings')}
                </Text>
                <Text
                  style={styles.textLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_label`}>
                  {translate('Bitcoin Lightning Network')}
                </Text>
                <Text
                  style={styles.textSubLabel}
                  testID={`${testIDPrefix}_value_settings_lightning_sub_label`}>
                  {translate('via your LNPay wallet')}
                </Text>
                <View style={styles.valueTagInfoViewWrapper}>
                  <Text
                    style={styles.textTableLabel}
                    testID={`${testIDPrefix}_value_settings_lightning_boost_sample_label`}>
                    {translate('Sample boost splits')}
                  </Text>
                  <ValueTagInfoView testID={testIDPrefix} transactions={boostTransactions} />
                </View>
                <View style={styles.valueTagInfoViewWrapper}>
                  <Text
                    style={styles.textTableLabel}
                    testID={`${testIDPrefix}_value_settings_lightning_streaming_sample_label`}>
                    {translate('Sample streaming splits')}
                  </Text>
                  <ValueTagInfoView testID={testIDPrefix} transactions={streamingTransactions} />
                </View>
              </View>
          }
          {hasValueInfo && (episodeLinks?.length > 0) && <Divider />}
          {
            episodeLinks?.length > 0 &&
              <View style={styles.fundingLinksWrapper}>
                <Text
                  style={styles.textHeader}
                  testID={`${testIDPrefix}_episode_funding_header`}>
                  {translate('Episode Links')}
                </Text>
                {episodeLinks}
              </View>
          }
          {(hasValueInfo || episodeLinks?.length > 0) && (podcastLinks?.length > 0) &&
            <Divider style={styles.divider} />
          }
          {
            podcastLinks?.length > 0 &&
              <View style={styles.fundingLinksWrapper}>
                <Text
                  style={styles.textHeader}
                  testID={`${testIDPrefix}_podcast_funding_header`}>
                  {translate('Podcast Links')}
                </Text>
                {podcastLinks}
              </View>
          }
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
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.semibold,
    marginTop: 12
  },
  fundingLinksWrapper: {
    marginTop: 0
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
  },
  innerTopView: {
    flex: 0,
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 12
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
    paddingHorizontal: 12
  },
  text: {
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 24
  },
  textHeader: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
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
    marginVertical: 16
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  valueTagInfoViewWrapper: {}
})
