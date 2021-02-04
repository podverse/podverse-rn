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
  Text
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { replaceLinebreaksWithBrTags, testProps } from '../lib/utility'
import { PV } from '../resources'
import { getMediaRefs } from '../services/mediaRef'
import { trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import { retriveNowPlayingItemChapters } from '../state/actions/playerChapters'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  episode?: any
  episodeId?: any
  includeGoToPodcast: boolean
  isLoading: boolean
  selectedItem?: any
  showActionSheet: boolean
  hasInternetConnection: boolean
  clips: any[]
  chapters: any[]
  totalClips: number
  totalChapters: number
}

const testIDPrefix = 'episode_screen'

export class EpisodeScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const episodeId = navigation.getParam('episodeId')
    const episodeTitle = navigation.getParam('episodeTitle')
    const podcastTitle = navigation.getParam('podcastTitle')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: translate('Episode'),
      headerRight: (
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

  constructor(props: Props) {
    super(props)

    const episode = this.props.navigation.getParam('episode')
    const episodeId = (episode && episode.id) || this.props.navigation.getParam('episodeId')
    const includeGoToPodcast = this.props.navigation.getParam('includeGoToPodcast')

    if (episode && !episode.podcast) {
      episode.podcast = {
        title: episode.podcast_title
      }
    }

    if (episode && episode.id) {
      this.props.navigation.setParams({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastTitle: episode.podcast?.title || ''
      })
    }

    this.state = {
      episode,
      episodeId,
      includeGoToPodcast,
      isLoading: false,
      showActionSheet: false,
      hasInternetConnection: false,
      clips: [],
      chapters: [],
      totalChapters: 0,
      totalClips: 0
    }
  }

  async componentDidMount() {
    const { episode, episodeId } = this.state
    this._initializePageData()
    const pageTitle = episode?.podcast
      ? translate('Episode Screen - ') + episode.podcast.title + ' - ' + episode.title
      : translate('Episode Screen - ') + translate('no info available')
    trackPageView('/episode/' + episodeId, pageTitle)
  }

  async _initializePageData() {
    const hasInternetConnection = await hasValidNetworkConnection()
    if (!hasInternetConnection) {
      this.setState({
        hasInternetConnection
      })
    } else {
      const { episode } = this.state

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
        hasInternetConnection
      })
    }
  }

  _handleCancelPress = () => {
    return new Promise((resolve, reject) => {
      this.setState({ showActionSheet: false }, resolve)
    })
  }

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
    const showChaptersCell = hasInternetConnection && totalChapters > 0

    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(episodeId)

    return (
      <ScrollView style={styles.view} {...testProps('episode_screen_view')}>
        <EpisodeTableHeader
          episode={episode}
          episodeDownloaded={episodeDownloaded}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(episode, null, episode.podcast, userPlaybackPosition))
          }
          isLoading={isLoading}
          mediaFileDuration={mediaFileDuration}
          testID={testIDPrefix}
          userPlaybackPosition={userPlaybackPosition}
        />
        {showClipsCell && (
          <TouchableOpacity
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
          html={episode?.description || ''}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          disableScrolling={true}
        />
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(selectedItem, navigation, {
              handleDismiss: this._handleCancelPress,
              handleDownload: episodeDownloading ? null : this._handleDownloadPressed,
              includeGoToPodcast
            })
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
  showNotesView: {
    margin: 8
  },
  showNotesViewText: {
    fontSize: PV.Fonts.sizes.lg
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
