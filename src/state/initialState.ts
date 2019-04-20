import { InitialState } from 'src/resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
  screenPlaylist: {
    flatListData: [],
    playlist: null
  },
  screenPlaylists: {
    flatListData: []
  },
  session: {
    userInfo: {},
    isLoggedIn: false
  },
  settings: {
    nsfwMode: true
  },
  showPlayer: false,
  subscribedPodcasts: []
}

export default initialTheme
