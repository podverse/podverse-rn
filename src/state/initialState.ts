import { Dimensions } from 'react-native'
import { isPortrait, pvIsTablet } from '../lib/deviceDetection'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'
import { v4vSettingsDefault } from './actions/v4v/v4v'

const deviceType = pvIsTablet() ? 'tablet' : 'mobile'

const initialTheme: InitialState = {
  isInMaintenanceMode: false,
  deviceType,
  screen: {
    orientation: isPortrait() ? 'portrait' : 'landscape',
    // We actually need the *window* width not screen to handle iPad split view...
    screenWidth: Dimensions.get('window').width
  },
  globalTheme: {},
  fontScale: 1,
  fontScaleMode: null,
  autoDownloadSettings: {},
  autoQueueSettings: {},
  autoQueueSettingsPosition: 'last',
  autoQueueDownloadsOn: false,
  downloadsArrayInProgress: [],
  downloadsArrayFinished: [],
  downloadsActive: {},
  downloadedEpisodeIds: {},
  downloadedEpisodeLimitCount: 5,
  downloadedEpisodeLimitDefault: null,
  downloadedPodcastEpisodeCounts: {},
  downloadedPodcasts: [],
  customRSSParallelParserLimit: PV.CustomRSS.parallelParserDefaultLimit,
  censorNSFWText: true,
  customAPIDomain: '',
  customAPIDomainEnabled: false,
  customWebDomain: '',
  customWebDomainEnabled: false,
  errorReportingEnabled: false,
  hideCompleted: false,
  listenTrackingEnabled: false,
  jumpBackwardsTime: PV.Player.jumpBackSeconds.toString(),
  jumpForwardsTime: PV.Player.jumpSeconds.toString(),
  addCurrentItemNextInQueue: true,
  overlayAlert: {
    shouldShowAlert: false
  },
  parsedTranscript: null,
  clipIntervalActive: false,
  chapterIntervalActive: true,
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
    remoteSkipButtonsAreTimeJumps: true
  },
  playlists: {
    myPlaylists: [],
    subscribedPlaylists: []
  },
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
    queryFrom: PV.Filters._fromThisEpisodeKey,
    queryPage: 1,
    querySort: PV.Filters._topPastWeek,
    selectedFromLabel: '',
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
      isPublic: false,
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
    v4v: {
      showLightningIcons: false,
      settings: v4vSettingsDefault,
      providers: {
        connected: []
      },
      streamingValueOn: false,
      previousTransactionErrors: {
        boost: [],
        streaming: []
      },
      senderInfo: {
        name: translate('anonymous')
      },
      boostagramMessage: ''
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
  newEpisodesCount: {},
  hideNewEpisodesBadges: false,
  hideDividersInLists: false,
  imageFullViewSourceUrl: '',
  imageFullViewShow: false,
  refreshSubscriptionsOnLaunch: true
}

export default initialTheme
