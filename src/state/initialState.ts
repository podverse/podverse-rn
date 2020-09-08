import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
  fontScale: 1,
  fontScaleMode: null,
  autoDownloadSettings: {},
  downloadsArray: [],
  downloadsActive: {},
  downloadedEpisodeIds: {},
  downloadedEpisodeLimitCount: 5,
  downloadedEpisodeLimitDefault: null,
  downloadedPodcastEpisodeCounts: {},
  downloadedPodcasts: [],
  addByRSSPodcasts: [],
  censorNSFWText: true,
  offlineModeEnabled: false,
  overlayAlert: {
    shouldShowAlert: false
  },
  player: {
    hasErrored: false,
    isPlaying: false,
    nowPlayingItem: null,
    playbackRate: 1,
    shouldContinuouslyPlay: false,
    showMakeClip: false,
    showMiniPlayer: false,
    sleepTimer: {
      defaultTimeRemaining: PV.Player.defaultSleepTimerInSeconds,
      isActive: false,
      timeRemaining: PV.Player.defaultSleepTimerInSeconds
    }
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
    message: '',
    productId: '',
    purchaseToken: '',
    showContactSupportLink: false,
    showDismissLink: false,
    showRetryLink: false,
    title: '',
    transactionId: '',
    transactionReceipt: ''
  },
  screenPlayer: {
    endOfResultsReached: false,
    flatListData: [],
    flatListDataTotalCount: null,
    hideRightItemWhileLoading: false,
    isLoading: false,
    isLoadingMore: false,
    isQuerying: false,
    queryFrom: PV.Filters._fromThisEpisodeKey,
    queryPage: 1,
    querySort: PV.Filters._topPastWeek,
    showFullClipInfo: false,
    showHeaderActionSheet: false,
    showMoreActionSheet: false,
    showNoInternetConnectionMessage: false,
    showShareActionSheet: false,
    viewType: PV.Filters._showNotesKey
  },
  screenPlaylist: {
    flatListData: [],
    flatListDataTotalCount: null,
    playlist: null
  },
  session: {
    userInfo: {
      addByRSSPodcastFeedUrls: [],
      email: '',
      freeTrialExpiration: '',
      historyItems: [],
      id: '',
      membershipExpiration: '',
      name: '',
      playlists: [],
      queueItems: [],
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
  subscribedPodcastsTotalCount: 0,
  userAgent: ''
}

export default initialTheme
