import { InitialState } from 'src/resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
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
