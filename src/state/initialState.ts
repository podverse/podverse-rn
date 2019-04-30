import { InitialState } from 'src/resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
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
      subscribedPlaylistIds: [],
      subscribedPodcastIds: [],
      subscribedUserIds: []
    },
    isLoggedIn: false
  },
  settings: {
    nsfwMode: true
  },
  showPlayer: false,
  subscribedPodcasts: []
}

export default initialTheme
