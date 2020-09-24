import 'reactn'
import { GlobalTheme, InitialState, UserInfo } from '../resources/Interfaces'

declare module 'reactn/default' {
  export interface State {
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
    offlineModeEnabled: any
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
      hideRightItemWhileLoading?: boolean
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
    censorNSFWText: boolean
    customAPIDomain?: string
    customAPIDomainEnabled?: boolean
    customWebDomain?: string
    customWebDomainEnabled?: boolean
    userAgent?: string
  }
}
