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
  flatList?: any
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
  textInputWrapper?: any
  view?: any
}

export interface UserInfo {
  addByRSSPodcastFeedUrls?: []
  email?: string
  freeTrialExpiration?: string
  historyItems?: []
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
  addByRSSPodcasts: any[]
  censorNSFWText?: boolean
  offlineModeEnabled?: any
  overlayAlert: {
    shouldShowAlert: boolean
  }
  player: {
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
    hideRightItemWhileLoading: boolean
    isLoading: boolean
    isLoadingMore: boolean
    isQuerying: boolean
    queryFrom: string | null
    queryPage: number
    querySort: string | null
    selectedItem?: any
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
  settings: {
    nsfwMode: boolean
  }
  session: {
    isLoggedIn: boolean
    userInfo: UserInfo
  }
  subscribedPodcasts: []
  subscribedPodcastsTotalCount: number
  userAgent?: string
}

export interface IActionSheet {
  media: {
    moreButtons: any
  }
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
  _chronologicalKey: string
  _oldestKey: string
  _myClipsKey: string
  _allEpisodesKey: string
  _podcastsKey: string
  _episodesKey: string
  _clipsKey: string
  _playlistsKey: string
  _aboutPodcastKey: string
  _showNotesKey: string
  _titleKey: string
  _myPlaylistsKey: string
  _fromThisPodcastKey: string
  _fromThisEpisodeKey: string
  _allCategoriesKey: string
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
