export const DeepLinks = {
  prefix: 'podverse://',
  Clip: {
    path: 'clip/:mediaRefId',
    pathPrefix: 'clip',
    pathWithId: (id: string) => `clip/${id}`
  },
  Episode: {
    path: 'episode/:episodeId',
    pathPrefix: 'episode',
    pathWithId: (id: string) => `episode/${id}`
  },
  Playlist: {
    path: 'playlist/:playlistId',
    pathPrefix: 'playlist',
    pathWithId: (id: string) => `playlist/${id}`
  },
  Playlists: {
    path: 'playlists'
  },
  Podcast: {
    path: 'podcast/:podcastId',
    pathPrefix: 'podcast',
    pathWithId: (id: string) => `podcast/${id}`
  },
  Podcasts: {
    path: 'podcasts'
  },
  Profile: {
    path: 'profile/:userId',
    pathPrefix: 'profile',
    pathWithId: (id: string) => `profile/${id}`
  },
  Profiles: {
    path: 'profiles'
  },
  Search: {
    path: 'search'
  }
}
