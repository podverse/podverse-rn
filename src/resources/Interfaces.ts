export interface GlobalTheme {
  activityIndicator?: any
  buttonGroupText?: any
  buttonGroupTextSelected?: any
  buttonPrimaryText?: any
  buttonPrimaryTextDisabled?: any
  buttonPrimaryWrapper?: any
  buttonPrimaryWrapperDisabled?: any
  divider?: any
  flatList?: any
  player?: any
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
  globalTheme: GlobalTheme,
  session: {
    userInfo: UserInfo,
    isLoggedIn: boolean
  },
  showPlayer: boolean,
  subscribedPodcasts: [{}]
}

interface FontSizes {
  [size: string]: number
}

interface FontWeight {
  [weight: string]: string
}

export interface FontType {
  sizes: FontSizes,
  weights: FontWeight
}

export interface ISettings {
  nsfwMode: boolean
}
