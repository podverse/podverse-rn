import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import React from 'reactn'
import {
  ActionSheet,
  EpisodeTableHeader,
  HTMLScrollView,
  Icon,
  NavSearchIcon,
  NavShareIcon,
  ScrollView,
  Text,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { replaceLinebreaksWithBrTags } from '../lib/utility'
import { PV } from '../resources'
import { getEpisode } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { getTrackingIdText, trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import { retriveNowPlayingItemChapters } from '../state/actions/playerChapters'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  chapters: any[]
  clips: any[]
  episode?: any
  episodeId?: any
  hasInternetConnection: boolean
  includeGoToPodcast: boolean
  isLoading: boolean
  selectedItem?: any
  showActionSheet: boolean
  totalClips: number
  totalChapters: number
}

const testIDPrefix = 'episode_screen'

export class EpisodeScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const episode = this.props.navigation.getParam('episode')
    const episodeId = episode?.id || this.props.navigation.getParam('episodeId')
    const includeGoToPodcast = this.props.navigation.getParam('includeGoToPodcast')
    const hasInternetConnection = this.props.navigation.getParam('hasInternetConnection')
    const id = episode?.id || episodeId

    if (episode && !episode.podcast) {
      episode.podcast = {
        title: episode.podcast_title
      }
    }

    if (id) {
      this.props.navigation.setParams({
        episodeId: id,
        episodeTitle: episode?.title || '',
        podcastTitle: episode?.podcast?.title || ''
      })
    }

    this.state = {
      episode,
      episodeId,
      hasInternetConnection: !!hasInternetConnection,
      includeGoToPodcast,
      isLoading: !episode,
      showActionSheet: false,
      clips: [],
      chapters: [],
      totalChapters: 0,
      totalClips: 0
    }
  }

  static navigationOptions = ({ navigation }) => {
    const episodeId = navigation.getParam('episodeId')
    const episodeTitle = navigation.getParam('episodeTitle')
    const podcastTitle = navigation.getParam('podcastTitle')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: translate('Episode'),
      headerRight: () => (
        <RNView style={core.row}>
          {!addByRSSPodcastFeedUrl && (
            <NavShareIcon
              endingText={translate('shared using brandName')}
              episodeTitle={episodeTitle}
              podcastTitle={podcastTitle}
              urlId={episodeId}
              urlPath={PV.URLs.webPaths.episode}
            />
          )}
          <NavSearchIcon navigation={navigation} />
        </RNView>
      )
    }
  }

  componentDidMount() {
    const { episode, episodeId } = this.state
    this._initializePageData()
    const episodeTitle = episode?.title ? episode.title : translate('Untitled Episode')
    const titleToEncode = episode?.podcast
      ? episode.podcast.title + ' - ' + episodeTitle
      : translate('no info available')

    trackPageView('/episode/' + getTrackingIdText(episodeId), translate('Episode Screen - '), titleToEncode)
  }

  async _initializePageData() {
    const { episodeId } = this.state
    let { episode } = this.state
    const hasInternetConnection = await hasValidNetworkConnection()
    
    if (!hasInternetConnection) {
      this.setState({ hasInternetConnection: !hasInternetConnection })
    } else if (!episode && episodeId) {
      episode = await getEpisode(episodeId)
      this.setState({
        episode,
        isLoading: false
      })
    } else {
      /*
        Always get the full episode since the episode.description passed from
        the previous screen's list view will be limited to 2500 characters.
      */
      episode = await getEpisode(episodeId)
      this.setState({ episode })
    }

    if (episode?.id) {
      const [clips, totalClips] = await getMediaRefs({
        episodeId: episode.id,
        includeEpisode: false,
        includePodcasts: false,
        sort: PV.Filters._chronologicalKey
      })

      const chapters = await retriveNowPlayingItemChapters(episode.id)

      this.setState({
        chapters,
        clips,
        totalClips,
        totalChapters: chapters && chapters.length,
        hasInternetConnection: !!hasInternetConnection
      })
    }


  }

  _handleCancelPress = () => new Promise((resolve) => {
    this.setState({ showActionSheet: false }, resolve)
  })

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  render() {
    const { navigation } = this.props
    const {
      episode,
      includeGoToPodcast,
      isLoading,
      selectedItem,
      showActionSheet,
      hasInternetConnection,
      totalChapters,
      totalClips,
      clips,
      chapters
    } = this.state
    const { downloadedEpisodeIds, downloadsActive } = this.global

    const episodeId = episode && episode.id

    if (episode?.description) episode.description = replaceLinebreaksWithBrTags(episode.description)

    const episodeDownloaded = episode && !!downloadedEpisodeIds[episode.id]
    const episodeDownloading = episode && !!downloadsActive[episode.id]

    const showClipsCell = hasInternetConnection && totalClips > 0
    const showChaptersCell = hasInternetConnection && !!episode?.chaptersUrl

    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(episodeId)

    const extraHtmlScrollViewPadding = showChaptersCell || showClipsCell
      ? styles.htmlScrollView
      : {}

    return (
      <ScrollView
        style={styles.view}
        testID='episode_screen_view'>
        <EpisodeTableHeader
          episode={episode}
          episodeDownloaded={episodeDownloaded}
          episodeDownloading={episodeDownloading}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(episode, null, episode.podcast, userPlaybackPosition))
          }
          isLoading={isLoading}
          mediaFileDuration={mediaFileDuration}
          testID={testIDPrefix}
          userPlaybackPosition={userPlaybackPosition}
        />
        {
          !isLoading && (
            <View>
              {showClipsCell && (
                <TouchableOpacity
                  accessibilityHint={translate('ARIA HINT - show clips from this episode')}
                  accessibilityLabel={translate('Clips')}
                  accessibilityRole='button'
                  activeOpacity={1}
                  style={styles.showNotesCell}
                  onPress={() => {
                    this.props.navigation.navigate(PV.RouteNames.EpisodeMediaRefScreen, {
                      episode,
                      viewType: PV.Filters._clipsKey,
                      title: 'Clips',
                      initialData: clips,
                      totalItems: totalClips
                    })
                  }}>
                  <>
                    <Text style={styles.showNotesCellText} testID={testIDPrefix}>
                      {translate('Clips')}
                    </Text>
                    <Icon name='arrow-right' size={15} />
                  </>
                </TouchableOpacity>
              )}
              {showChaptersCell && (
                <TouchableOpacity
                  accessibilityHint={translate('ARIA HINT - show the chapters for this episode')}
                  accessibilityLabel={translate('Chapters')}
                  accessibilityRole='button'
                  activeOpacity={1}
                  style={styles.showNotesCell}
                  onPress={() => {
                    this.props.navigation.navigate(PV.RouteNames.EpisodeMediaRefScreen, {
                      episode,
                      viewType: PV.Filters._chaptersKey,
                      title: 'Chapters',
                      initialData: chapters,
                      totalItems: totalChapters
                    })
                  }}>
                  <>
                    <Text style={styles.showNotesCellText} testID={testIDPrefix}>
                      {translate('Chapters')}
                    </Text>
                    <Icon name='arrow-right' size={15} />
                  </>
                </TouchableOpacity>
              )}
              <HTMLScrollView
                disableScrolling
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                html={episode?.description || ''}
                sectionTitle={translate('Episode Summary')}
                style={extraHtmlScrollViewPadding}
              />
            </View>
          )
        }
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleCancelPress,
                handleDownload: this._handleDownloadPressed,
                includeGoToPodcast
              },
              'episode'
            )
          }
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  htmlScrollView: {
    marginVertical: 12
  },
  showNotesCell: {
    padding: 15,
    borderTopColor: PV.Colors.grayLighterTransparent,
    borderBottomColor: PV.Colors.grayLighterTransparent,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  showNotesCellText: {
    fontSize: PV.Fonts.sizes.md
  }
})
