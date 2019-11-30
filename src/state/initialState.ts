import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
  autoDownloadSettings: {},
  downloadsArray: [],
  downloadsActive: {},
  downloadedEpisodeIds: {},
  downloadedPodcastEpisodeCounts: {},
  downloadedEpisodeLimitCount: 5,
  downloadedEpisodeLimitDefault: null,
  player: {
    hasErrored: false,
    isPlaying: false,
    nowPlayingItem: null,
    playbackRate: 1,
    shouldContinuouslyPlay: false,
    showMakeClip: false,
    showMiniPlayer: false
  },
  playlists: {
    myPlaylists: [],
    subscribedPlaylists: []
  },
  profile: {
    flatListData: [],
    user: null
  },
  profiles: {
    flatListData: [],
    flatListDataTotalCount: null
  },
  purchase: {
    isLoading: true,
    message: 'Updating the Podverse servers...',
    productId: '',
    purchaseToken: '',
    showContactSupportLink: false,
    showDismissLink: false,
    showRetryLink: false,
    title: 'Processing Transaction',
    transactionId: '',
    transactionReceipt: ''
  },
  screenPlayer: {
    endOfResultsReached: false,
    flatListData: [],
    flatListDataTotalCount: null,
    isLoading: false,
    isLoadingMore: false,
    queryFrom: PV.Keys.QUERY_FROM_THIS_PODCAST,
    queryPage: 1,
    querySort: PV.Keys.QUERY_SORT_TOP_PAST_WEEK,
    showFullClipInfo: false,
    showHeaderActionSheet: false,
    showMoreActionSheet: false,
    showShareActionSheet: false,
    viewType: PV.Keys.VIEW_TYPE_SHOW_NOTES
  },
  screenPlaylist: {
    flatListData: [],
    flatListDataTotalCount: null,
    playlist: null
  },
  session: {
    userInfo: {
      email: '',
      freeTrialExpiration: '',
      historyItems: [],
      id: '',
      membershipExpiration: '',
      name: '',
      playlists: [],
      subscribedPlaylistIds: [],
      subscribedPodcastIds: [],
      subscribedUserIds: []
    },
    isLoggedIn: false
  },
  settings: {
    nsfwMode: true
  },
  subscribedPodcasts: [],
  subscribedPodcastsTotalCount: 0
}

export default initialTheme
