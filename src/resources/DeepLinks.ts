import Config from 'react-native-config'

export const DeepLinks = {
  prefix: Config.DEEP_LINK_PREFIX,
  About: {
    path: 'about'
  },
  Account: {
    resetPassword: 'reset-password'
  },
  AddByRSSPodcastFeedUrl: {
    path: 'podcast-by-feed-url/add*',
    pathPrefix: 'podcast-by-feed-url'
  },
  Clip: {
    path: 'clip/:mediaRefId',
    pathPrefix: 'clip'
  },
  Contact: {
    path: 'contact'
  },
  Episode: {
    path: 'episode/:episodeId',
    pathPrefix: 'episode'
  },
  Membership: {
    path: 'membership'
  },
  Playlist: {
    path: 'playlist/:playlistId',
    pathPrefix: 'playlist'
  },
  Playlists: {
    path: 'playlists'
  },
  Podcast: {
    path: 'podcast/:podcastId',
    pathPrefix: 'podcast'
  },
  Podcasts: {
    path: 'podcasts'
  },
  Profile: {
    path: 'profile/:userId',
    pathPrefix: 'profile'
  },
  Profiles: {
    path: 'profiles'
  },
  Search: {
    path: 'search'
  },
  Support: {
    path: 'support'
  },
  Terms: {
    path: 'terms'
  },
  XMPP: {
    path: 'xmpp'
  },
  providers: {
    ALBY: {
      oauthCallbackPath: 'callback_alby'
    }
  }
}
