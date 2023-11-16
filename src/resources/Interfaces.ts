import { TranscriptRow, ValueTransaction } from 'podverse-shared'
import { AutoQueueSettingsPosition } from '../services/autoQueue'
import { QueueRepeatModeMusic } from '../services/queue'
import { V4VProviderConnectedState, V4VSettings } from '../state/actions/v4v/v4v'

export interface GlobalTheme {
  actionSheetButton?: any
  actionSheetButtonCancel?: any
  actionSheetButtonDisabled?: any
  actionSheetButtonText?: any
  actionSheetButtonTextCancel?: any
  actionSheetButtonTextDisabled?: any
  actionSheetButtonUnderlay?: any
  actionSheetButtonCancelUnderlay?: any
  actionSheetHeaderText?: any
  actionSheetView?: any
  activityIndicator?: any
  activityIndicatorAlternate?: any
  buttonGroupText?: any
  buttonGroupTextSelected?: any
  buttonImage?: any
  buttonPrimaryText?: any
  buttonDisabledText?: any
  buttonPrimaryWrapper?: any
  buttonDisabledWrapper?: any
  divider?: any
  dropdownButtonIcon?: any
  dropdownButtonText?: any
  flatList?: any
  headerText?: any
  headerTextSuccess?: any
  inputContainerText?: any
  link?: any
  liveStatusBadge?: any
  liveStatusBadgeText?: any
  makeClipPlayerControlsWrapper?: any
  membershipTextExpired?: any
  membershipTextExpiring?: any
  membershipTextPremium?: any
  modalBackdrop?: any
  modalInnerWrapper?: any
  placeholderText?: any
  player?: any
  playerClipTimeFlag?: any
  playerText?: any
  sectionHeaderBackground?: any
  selectorText?: any
  swipeRowBack?: any
  swipeRowBackMultiple?: any
  swipeRowBackButtonDanger?: any
  swipeRowBackButtonPrimary?: any
  tabbar?: any
  tabbarItem?: any
  tableCellTextPrimary?: any
  tableCellTextSecondary?: any
  tableSectionHeader?: any
  tableSectionHeaderTransparent?: any
  tableSectionHeaderIcon?: any
  tableSectionHeaderText?: any
  text?: any
  textInput?: any
  textInputIcon?: any
  textInputEyeBrow?: any
  textInputSubText?: any
  textInputWrapper?: any
  textInputWrapperOuter?: any
  textSecondary?: boolean
  textNowPlaying?: boolean
  view?: any
}

export interface UserInfo {
  addByRSSPodcastFeedUrls?: []
  email?: string
  freeTrialExpiration?: string
  historyItems?: []
  historyItemsCount: number
  historyItemsIndex: Record<string, any> | null
  historyQueryPage: number
  id?: string
  isPublic: boolean
  membershipExpiration?: string | null
  name?: string
  notifications?: any[]
  notificationsEnabled: boolean
  playlists?: []
  queueItems?: []
  subscribedPlaylistIds?: []
  subscribedPodcastIds?: []
  subscribedUserIds?: []
}

export interface InitialState {
  isInMaintenanceMode: boolean
  deviceType: 'mobile' | 'tablet'
  screen: {
    orientation: 'portrait' | 'landscape'
    screenWidth: number
  }
  globalTheme: GlobalTheme
  fontScale: number
  fontScaleMode: string | null
  autoDownloadSettings: any
  autoQueueSettings: any
  autoQueueSettingsPosition: AutoQueueSettingsPosition
  autoQueueDownloadsOn: boolean
  downloadsActive: any
  downloadsArrayInProgress: any[]
  downloadsArrayFinished: any[]
  downloadedEpisodeIds: any
  downloadedPodcastEpisodeCounts: any
  downloadedEpisodeLimitCount: number
  downloadedEpisodeLimitDefault: number | null
  downloadedPodcasts: any[]
  customRSSParallelParserLimit: number
  censorNSFWText?: boolean
  customAPIDomain?: string
  customAPIDomainEnabled?: boolean
  customWebDomain?: string
  customWebDomainEnabled?: boolean
  errorReportingEnabled: boolean
  hideCompleted: boolean
  listenTrackingEnabled: boolean
  urlsAPI?: any
  urlsWeb?: any
  jumpBackwardsTime: string
  jumpForwardsTime: string
  addCurrentItemNextInQueue: boolean
  overlayAlert: {
    shouldShowAlert: boolean
  }
  parsedTranscript: TranscriptRow[] | null
  clipIntervalActive: boolean
  currentChapter: any
  currentChapters: any
  currentTocChapter: any
  currentTocChapters: any
  currentTocChaptersStartTimePositions: any
  player: {
    backupDuration?: number
    hasErrored: boolean
    nowPlayingItem: any
    episode: any | null
    playbackRate: number
    showMakeClip: boolean
    showMiniPlayer: boolean
    shouldContinuouslyPlay: boolean
    playbackState: any
    sleepTimer: {
      defaultTimeRemaining: number
      isActive: boolean
      timeRemaining: number
    }
    videoInfo: {
      videoDuration: number
      videoIsLoaded: boolean
      videoPosition: number
    }
    hidePlaybackSpeedButton: boolean
    remoteSkipButtonsAreTimeJumps: boolean
    queueRepeatModeMusic: QueueRepeatModeMusic
  }
  playlists: {
    myPlaylists: []
    subscribedPlaylists: []
  }
  podcastsGridViewEnabled: boolean
  profile: {
    flatListData: []
    user: any
  }
  profiles: {
    flatListData: []
    flatListDataTotalCount: null
  }
  purchase: {
    isLoading: boolean
    message: string
    productId: string
    purchaseToken: string
    showContactSupportLink: boolean
    showDismissLink: boolean
    showRetryLink: boolean
    title: string
    transactionId: string
    transactionReceipt: string
  }
  screenPlayer: {
    endOfResultsReached: boolean
    flatListData: any[]
    flatListDataTotalCount: number | null
    isLoading: boolean
    isLoadingMore: boolean
    isQuerying: boolean
    liveStreamWasPaused: boolean
    queryFrom: string | null
    queryPage: number
    querySort: string | null
    selectedFromLabel?: string | null
    selectedItem?: any
    selectedSortLabel?: string | null
    showFullClipInfo: boolean
    showHeaderActionSheet: boolean
    showMoreActionSheet: boolean
    showNoInternetConnectionMessage: boolean
    showShareActionSheet: boolean
    viewType: string | null
  }
  screenPlaylist: {
    flatListData: []
    flatListDataTotalCount: number | null
    playlist?: any
  }
  session: {
    isLoggedIn: boolean
    userInfo: UserInfo
    v4v: {
      showLightningIcons: boolean
      settings: V4VSettings
      providers: {
        connected: V4VProviderConnectedState[]
      }
      streamingValueOn: boolean
      previousTransactionErrors: {
        boost: BannerInfoError[]
        streaming: BannerInfoError[]
      }
      boostagramMessage: string
      valueTimeSplitIsActive: boolean
    }
  }
  subscribedPodcasts: []
  subscribedPodcastsTotalCount: number
  userAgent?: string
  bannerInfo: BannerInfo
  tempMediaRefInfo: {
    startTime?: number
    endTime?: number | null
    clipTitle?: string
  }
  screenReaderEnabled: boolean
  newEpisodesCount: {
    [key: string]: number
  }
  hideNewEpisodesBadges: boolean
  hideDividersInLists: boolean
  imageFullViewSourceUrl?: string
  imageFullViewShow?: boolean
  refreshSubscriptionsOnLaunch?: boolean
  showPodcastsListPopover: boolean
  slidingPositionOverride: number | null
}

export interface BannerInfoError {
  error: Error
  details: Record<string, any>
}

export interface BannerInfo {
  show: boolean
  description: string
  errors?: BannerInfoError[]
  transactions?: ValueTransaction[]
  totalAmount?: number
}

export interface IActionSheet {
  media: {
    moreButtons: any
  }
}

export interface TempMediaRef {
  startTime: number | undefined
  endTime: number | null
  clipTitle: string | undefined
}

export interface IFilters {
  _subscribedKey: string
  _downloadedKey: string
  _allPodcastsKey: string
  _customFeedsKey: string
  _categoryKey: string
  _alphabeticalKey: string
  _mostRecentKey: string
  _randomKey: string
  _topPastDay: string
  _topPastWeek: string
  _topPastMonth: string
  _topPastYear: string
  _topAllTime: string
  _chronologicalKey: string
  _oldestKey: string
  _myClipsKey: string
  _allEpisodesKey: string
  _podcastsKey: string
  _episodesKey: string
  _tracksKey: string
  _hideCompletedKey: string
  _showCompletedKey: string
  _clipsKey: string
  _chaptersKey: string
  _playlistsKey: string
  _myPlaylistsKey: string
  _fromThisPodcastKey: string
  _fromThisEpisodeKey: string
  _sectionCategoryKey: string
  _sectionFilterKey: string
  _sectionFromKey: string
  _sectionMyPlaylistsKey: string
  _sectionSortKey: string
  _sectionSubscribedPlaylistsKey: string
  _episodeNumberAscKey: string
}

interface IFontLargeSizes {
  [largeSize: string]: number
}

interface IFontSizes {
  [size: string]: number
}

interface IFontWeights {
  [weight: string]: string
}

export interface IFonts {
  largeSizes: IFontLargeSizes
  sizes: IFontSizes
  weights: IFontWeights
  fontScale: any
}
