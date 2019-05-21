export interface GlobalTheme {
  actionSheetButton?: any
  actionSheetButtonCancel?: any
  actionSheetButtonText?: any
  actionSheetButtonTextCancel?: any
  actionSheetButtonUnderlay?: any
  actionSheetButtonCancelUnderlay?: any
  actionSheetHeaderText?: any
  actionSheetView?: any
  activityIndicator?: any
  buttonGroupText?: any
  buttonGroupTextSelected?: any
  buttonImage?: any
  buttonPrimaryText?: any
  buttonPrimaryTextDisabled?: any
  buttonPrimaryWrapper?: any
  buttonPrimaryWrapperDisabled?: any
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
  playerText?: any
  selectorText?: any
  swipeRowBack?: any
  tabbar?: any
  tabbarItem?: any
  tableCellTextPrimary?: any
  tableCellTextSecondary?: any
  tableSectionHeader?: any
  tableSectionHeaderText?: any
  text?: any
  textInput?: any
  textInputWrapper?: any
  view?: any
}

export interface UserInfo {
  email?: string,
  freeTrialExpiration?: string,
  historyItems?: [],
  id?: string,
  membershipExpiration?: string | null,
  name?: string,
  playlists?: [],
  queueItems?: [],
  subscribedPlaylistIds?: [],
  subscribedPodcastIds?: [],
  subscribedUserIds?: []
}

export interface InitialState {
  globalTheme: GlobalTheme
  player: {
    isPlaying: boolean
    nowPlayingItem: any
    playbackRate: number
    shouldContinuouslyPlay: boolean
    showMiniPlayer: boolean
  }
  screenMakeClip: {
    isShowing: boolean
  }
  screenPlayer: {
    endOfResultsReached: boolean
    flatListData: any[]
    isLoading: boolean
    isLoadingMore: boolean
    queryFrom: string | null
    queryPage: number
    querySort: string | null
    selectedItem?: any
    showFullClipInfo: boolean
    showHeaderActionSheet: boolean
    showMoreActionSheet: boolean
    showShareActionSheet: boolean
    viewType: string | null
  }
  screenPlaylist: {
    flatListData: []
    playlist?: any
  }
  screenPlaylists: {
    myPlaylists: []
    subscribedPlaylists: []
  }
  screenPlaylistsAddTo: {
    myPlaylists: []
  }
  screenProfile: {
    flatListData: []
    user: any
  }
  screenProfiles: {
    flatListData: []
  }
  session: {
    userInfo: UserInfo,
    isLoggedIn: boolean
  }
  settings: {
    nsfwMode: boolean
  }
  subscribedPodcasts: []
}

export interface IActionSheet {
  media: {
    moreButtons: any
  }
}

export interface IFilters {
  downloadedKey: string
  allEpisodesKey: string
  clipsKey: string
  aboutKey: string
  mostRecentKey: string
  topPastDay: string
  topPastWeek: string
  topPastMonth: string
  topPastYear: string
}

interface IFontSizes {
  [size: string]: number
}

interface IFontWeights {
  [weight: string]: string
}

export interface IFonts {
  sizes: IFontSizes,
  weights: IFontWeights
}
