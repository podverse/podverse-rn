import { StyleSheet, View as RNView } from 'react-native'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import { HTMLScrollView, NavOfficialLinkIcon, PodcastTableHeader, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getTrackingIdText, trackPageView } from '../services/tracking'
import { core } from '../styles'

type Props = any

type State = {
  podcast: any
  podcastId: string
}

const testIDPrefix = 'podcast_info_screen'

export class PodcastInfoScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const podcast = this.props.navigation.getParam('podcast')
    const podcastId = podcast?.id || podcast?.addByRSSPodcastFeedUrl || this.props.navigation.getParam('podcastId')

    this.state = {
      podcast,
      podcastId
    }
  }

  static navigationOptions = ({ navigation }) => {
    const podcast = navigation.getParam('podcast')
    const hasLinkUrl = !!podcast?.linkUrl
    const { globalTheme } = getGlobal()

    return {
      title: translate('More Info'),
      headerRight: () => (
        <RNView style={core.row}>
          {hasLinkUrl && (
            <NavOfficialLinkIcon globalTheme={globalTheme} linkUrl={podcast.linkUrl} />
          )}
        </RNView>
      )
    } as NavigationStackOptions
  }

  componentDidMount() {
    const { podcast, podcastId } = this.state

    const titleToEncode = podcast ? podcast.title : translate('no info available')
    const addByRSSPodcastFeedUrl = podcast?.addByRSSPodcastFeedUrl

    trackPageView(
      '/podcast/info/' + getTrackingIdText(podcastId, !!addByRSSPodcastFeedUrl),
      'PodcastInfoScreen - ',
      titleToEncode
    )
  }

  showLeavingAppAlert = (url: string) => {
    PV.Alerts.LEAVING_APP_ALERT(url)
  }

  render() {
    const { podcast } = this.state
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')

    return (
      <View style={styles.content} testID={`${testIDPrefix}_view`}>
        <PodcastTableHeader
          addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
          podcastImageUrl={podcast && (podcast.shrunkImageUrl || podcast.imageUrl)}
          podcastTitle={podcast && podcast.title}
          podcastValue={podcast?.value}
          testID={testIDPrefix}
        />
        <HTMLScrollView
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          html={podcast.description ? `<body>${podcast.description}</body>` : ''}
          sectionTitle={translate('About')}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 8,
    marginVertical: 16
  }
})
