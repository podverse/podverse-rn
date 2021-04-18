import 'reactn'
import { BannerInfo, GlobalTheme, UserInfo } from '../resources/Interfaces'

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
    offlineModeEnabled: any
    overlayAlert: {
      shouldShowAlert: boolean
    }
    parser: {
      addByRSSPodcastAuthModal: {
        feedUrl: string
      }
    }
    player: {
      backupDuration?: number
      currentChapter: any
      currentChapters: any
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
      isLoading: boolean
      isLoadingMore: boolean
      isQuerying: boolean
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
      lightningPayEnabled: boolean
      boostAmount: number
      streamingAmount: number
    }
    subscribedPodcasts: []
    subscribedPodcastsTotalCount: number
    censorNSFWText: boolean
    customAPIDomain?: string
    customAPIDomainEnabled?: boolean
    customWebDomain?: string
    customWebDomainEnabled?: boolean
    urlsAPI?: any
    urlsWeb?: any
    userAgent?: string
    bannerInfo: BannerInfo
  }
}
