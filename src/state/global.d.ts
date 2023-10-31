import { Episode, NowPlayingItem, TranscriptRow } from 'podverse-shared'
import 'reactn'
import { AppModes } from '../resources/AppMode'
import { BannerInfo, GlobalTheme, UserInfo, TempMediaRef } from '../resources/Interfaces'
import { AutoQueueSettingsPosition } from '../services/queue'
import { V4VProviderConnectedState, V4VSenderInfo, V4VTransactionError } from '../state/actions/v4v/v4v'

declare module 'reactn/default' {
  export interface State {
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
    downloadedEpisodeLimitDefault: boolean | null
    downloadedPodcasts: any[]
    customRSSParallelParserLimit: number
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
      nowPlayingItem: NowPlayingItem
      episode: Episode
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
          boost: V4VTransactionError[]
          streaming: V4VTransactionError[]
        }
        senderInfo: V4VSenderInfo
        boostagramMessage: string
        valueTimeSplitIsActive: boolean
      }
    }
    subscribedPodcasts: []
    subscribedPodcastsTotalCount: number
    censorNSFWText: boolean
    hideCompleted: boolean
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
}
