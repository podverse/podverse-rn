import { TranscriptRow } from 'podverse-shared'
import 'reactn'
import { AppModes } from '../resources/AppMode'
import { BannerInfo, GlobalTheme, UserInfo, TempMediaRef } from '../resources/Interfaces'
import { AutoQueueSettingsPosition } from '../services/queue'

declare module 'reactn/default' {
  export interface State {
    globalTheme: GlobalTheme
    fontScale: number
    fontScaleMode: string | null
    autoDownloadSettings: any
    autoQueueSettings: any
    autoQueueSettingsPosition: AutoQueueSettingsPosition
    downloadsActive: any
    downloadsArrayInProgress: any[]
    downloadsArrayFinished: any[]
    downloadedEpisodeIds: any
    downloadedPodcastEpisodeCounts: any
    downloadedEpisodeLimitCount: number
    downloadedEpisodeLimitDefault: boolean | null
    downloadedPodcasts: any[]
    offlineModeEnabled: any
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
      nowPlayingItem: any
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
      liveStreamWasPaused: boolean
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
    censorNSFWText: boolean
    customAPIDomain?: string
    customAPIDomainEnabled?: boolean
    customWebDomain?: string
    customWebDomainEnabled?: boolean
    errorReportingEnabled: boolean
    listenTrackingEnabled: boolean
    urlsAPI?: any
    urlsWeb?: any
    userAgent?: string
    appMode: AppModes
    bannerInfo: BannerInfo
    tempMediaRefInfo: TempMediaRef
    screenReaderEnabled: boolean
  }
}
