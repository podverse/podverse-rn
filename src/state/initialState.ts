import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'
import { DEFAULT_BOOST_PAYMENT, DEFAULT_STREAMING_PAYMENT } from './actions/valueTag'

const initialTheme: InitialState = {
  globalTheme: {},
  fontScale: 1,
  fontScaleMode: null,
  autoDownloadSettings: {},
  autoQueueSettings: {},
  autoQueueSettingsPosition: 'last',
  downloadsArrayInProgress: [],
  downloadsArrayFinished: [],
  downloadsActive: {},
  downloadedEpisodeIds: {},
  downloadedEpisodeLimitCount: 5,
  downloadedEpisodeLimitDefault: null,
  downloadedPodcastEpisodeCounts: {},
  downloadedPodcasts: [],
  censorNSFWText: true,
  customAPIDomain: '',
  customAPIDomainEnabled: false,
  customWebDomain: '',
  customWebDomainEnabled: false,
  errorReportingEnabled: false,
  hideCompleted: false,
  listenTrackingEnabled: false,
  offlineModeEnabled: false,
  jumpBackwardsTime: PV.Player.jumpBackSeconds.toString(),
  jumpForwardsTime: PV.Player.jumpSeconds.toString(),
  addCurrentItemNextInQueue: true,
  overlayAlert: {
    shouldShowAlert: false
  },
  parsedTranscript: null,
  currentChapter: null,
  currentChapters: [],
  currentChaptersStartTimePositions: [],
  player: {
    hasErrored: false,
    episode: null,
    nowPlayingItem: null,
    playbackRate: 1,
    shouldContinuouslyPlay: false,
    showMakeClip: false,
    showMiniPlayer: false,
    playbackState: null,
    sleepTimer: {
      defaultTimeRemaining: PV.Player.defaultSleepTimerInSeconds,
      isActive: false,
      timeRemaining: PV.Player.defaultSleepTimerInSeconds
    },
    videoInfo: {
      videoDuration: 0,
      videoIsLoaded: false,
      videoPosition: 0
    },
    hidePlaybackSpeedButton: false,
    remoteSkipButtonsAreTimeJumps: false
  },
  playlists: {
    myPlaylists: [],
    subscribedPlaylists: []
  },
  podcastValueFinal: null,
  podcastsGridViewEnabled: true,
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
    isLoading: false,
    isLoadingMore: false,
    isQuerying: false,
    liveStreamWasPaused: false,
    mediaRefIdToDelete: '',
    queryFrom: PV.Filters._fromThisEpisodeKey,
    queryPage: 1,
    querySort: PV.Filters._topPastWeek,
    selectedFromLabel: '',
    showDeleteConfirmDialog: false,
    showFullClipInfo: false,
    showHeaderActionSheet: false,
    showMoreActionSheet: false,
    showNoInternetConnectionMessage: false,
    showShareActionSheet: false,
    viewType: null
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
      historyItemsCount: 0,
      historyItemsIndex: null,
      historyQueryPage: 1,
      id: '',
      membershipExpiration: '',
      name: '',
      notifications: [],
      notificationsEnabled: false,
      playlists: [],
      queueItems: [],
      subscribedPlaylistIds: [],
      subscribedPodcastIds: [],
      subscribedUserIds: []
    },
    isLoggedIn: false,
    valueTagSettings: {
      lightningNetwork: {
        lnpay: {
          lnpayEnabled: false,
          globalSettings: {
            boostAmount: DEFAULT_BOOST_PAYMENT,
            streamingAmount: DEFAULT_STREAMING_PAYMENT
          }
        }
      },
      streamingEnabled: false
    }
  },
  subscribedPodcasts: [],
  subscribedPodcastsTotalCount: 0,
  urlsAPI: null,
  urlsWeb: null,
  userAgent: '',
  appMode: 'podcasts',
  bannerInfo: {
    show: false,
    description: ''
  },
  tempMediaRefInfo: {
    startTime: undefined,
    endTime: null,
    clipTitle: undefined
  },
  screenReaderEnabled: false,
  newEpisodesCount: {}
}

export default initialTheme
