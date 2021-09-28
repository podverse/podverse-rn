import { TranscriptRow, ValueTransaction } from 'podverse-shared'

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
  inputContainerText?: any
  link?: any
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
  selectorText?: any
  swipeRowBack?: any
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
  textInputWrapper?: any
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
  historyItemsIndex: any
  historyQueryPage: number
  id?: string
  membershipExpiration?: string | null
  name?: string
  playlists?: []
  queueItems?: []
  subscribedPlaylistIds?: []
  subscribedPodcastIds?: []
  subscribedUserIds?: []
}

export interface InitialState {
  globalTheme: GlobalTheme
  fontScale: number
  fontScaleMode: string | null
  autoDownloadSettings: any
  downloadsActive: any
  downloadsArray: any[]
  downloadedEpisodeIds: any
  downloadedPodcastEpisodeCounts: any
  downloadedEpisodeLimitCount: number
  downloadedEpisodeLimitDefault: number | null
  downloadedPodcasts: any[]
  censorNSFWText?: boolean
  customAPIDomain?: string
  customAPIDomainEnabled?: boolean
  customWebDomain?: string
  customWebDomainEnabled?: boolean
  errorReportingEnabled: boolean
  listenTrackingEnabled: boolean
  urlsAPI?: any
  urlsWeb?: any
  offlineModeEnabled?: any
  jumpBackwardsTime: string
  jumpForwardsTime: string
  addCurrentItemNextInQueue: boolean
  overlayAlert: {
    shouldShowAlert: boolean
  }
  parsedTranscript: TranscriptRow[] | null
  currentChapter: any
  currentChapters: any
  currentChaptersStartTimePositions: any
  player: {
    backupDuration?: number
    hasErrored: boolean
    isPlaying: boolean
    nowPlayingItem: any
    playbackRate: number
    showMakeClip: boolean
    showMiniPlayer: boolean
    shouldContinuouslyPlay: boolean
    sleepTimer: any
  }
  playlists: {
    myPlaylists: []
    subscribedPlaylists: []
  }
  podcastValueFinal: any
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
    mediaRefIdToDelete?: string
    queryFrom: string | null
    queryPage: number
    querySort: string | null
    selectedFromLabel?: string | null
    selectedItem?: any
    selectedSortLabel?: string | null
    showDeleteConfirmDialog: boolean
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
    valueTagSettings: {
      lightningNetwork: {
        lnpay: {
          walletSatsBalance?: number
          walletUserLabel?: string
          lnpayEnabled: boolean
          globalSettings: {
            boostAmount: number
            streamingAmount: number
          }
        }
      }
      streamingEnabled: boolean
    }
  }
  subscribedPodcasts: []
  subscribedPodcastsTotalCount: number
  userAgent?: string
  bannerInfo: BannerInfo
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
