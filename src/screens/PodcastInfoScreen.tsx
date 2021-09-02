import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { HTMLScrollView, PodcastTableHeader, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getTrackingIdText, trackPageView } from '../services/tracking'

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
    const podcastId =
      (podcast?.id) ||
      (podcast?.addByRSSPodcastFeedUrl) ||
      this.props.navigation.getParam('podcastId')

    this.state = {
      podcast,
      podcastId
    }
  }

  static navigationOptions = () => ({
    title: translate('More Info'),
    headerRight: null
  })

  componentDidMount() {
    const { podcast, podcastId } = this.state

    const titleToEncode = podcast
      ? podcast.title
      : translate('no info available')
    trackPageView('/podcast/info/' + getTrackingIdText(podcastId), translate('PodcastInfoScreen - '), titleToEncode)
  }

  showLeavingAppAlert = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    const { podcast } = this.state
    return (
      <View
        style={styles.content}
        testID={`${testIDPrefix}_view`}>
        <PodcastTableHeader
          podcastImageUrl={podcast && (podcast.shrunkImageUrl || podcast.imageUrl)}
          podcastTitle={podcast && podcast.title}
          testID={testIDPrefix}
        />
        <HTMLScrollView
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          html={podcast.description ? `<body>${podcast.description}</body>` : ''}
          sectionTitle={translate('About')} />
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
