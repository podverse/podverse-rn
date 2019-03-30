import { InitialState } from 'src/resources/Interfaces'

const initialTheme: InitialState = {
  globalTheme: {},
  session: {
    userInfo: {},
    isLoggedIn: false
  },
  showPlayer: false,
  subscribedPodcasts: []
}

export default initialTheme
