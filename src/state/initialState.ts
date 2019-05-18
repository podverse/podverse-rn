import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
  player: {
    isPlaying: false,
    nowPlayingItem: null,
    playbackRate: 1,
    shouldContinuouslyPlay: false,
    showMiniPlayer: false
  },
  screenMakeClip: {
    isShowing: false
  },
  screenPlayer: {
    endOfResultsReached: false,
    flatListData: [],
    isLoading: true,
    isLoadingMore: false,
    queryFrom: PV.Keys.QUERY_FROM_THIS_PODCAST,
    queryPage: 1,
    querySort: PV.Keys.QUERY_SORT_TOP_PAST_WEEK,
    showFullClipInfo: false,
    showHeaderActionSheet: false,
    showMoreActionSheet: false,
    showShareActionSheet: false,
    viewType: PV.Keys.VIEW_TYPE_SHOW_NOTES
  },
  screenPlaylist: {
    flatListData: [],
    playlist: null
  },
  screenPlaylists: {
    myPlaylists: [],
    subscribedPlaylists: []
  },
  screenPlaylistsAddTo: {
    myPlaylists: []
  },
  screenProfile: {
    flatListData: [],
    user: null
  },
  screenProfiles: {
    flatListData: []
  },
  session: {
    userInfo: {
      email: '',
      freeTrialExpiration: '',
      historyItems: [],
      id: '',
      membershipExpiration: null,
      name: '',
      playlists: [],
      subscribedPlaylistIds: [],
      subscribedPodcastIds: [],
      subscribedUserIds: []
    },
    isLoggedIn: false
  },
  settings: {
    nsfwMode: true
  },
  subscribedPodcasts: []
}

export default initialTheme
