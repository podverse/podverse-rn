import { Episode, NowPlayingItem, Podcast } from 'podverse-shared';

/* Constants */

// This timeout is a work-around for asynchronous state loading issues in background tabs.
const stateUpdateTimeout = 10000

/* Initialize */

export const registerCarModule = (onConnect, onDisconnect) => {
  // TODO: Android implementation
}

export const unregisterCarModule = (onConnect, onDisconnect) => { 
  // TODO: Android implementation
}

/* Root View */

export const showRootView = (subscribedPodcasts: Podcast[], historyItems: any[], queueItems: any[]) => {
    // TODO: Android implementation
}

/* Podcasts Tab */

export const handleCarPlayPodcastsUpdate = () => {
  // TODO: Android implementation
}

/* Podcast Episodes Tab */

// TODO: Android implementation

/* Queue Tab */

export const handleCarPlayQueueUpdateTwice = () => {
  // TODO: Android implementation
}

/* History Tab */

export const handleHistoryUpdate = () => {
  // TODO: Android implementation
}

/* Player Helpers */

export const showCarPlayerForEpisode = async (episode: Episode, podcast: Podcast) => {
  // TODO: Android implementation
}

export const showCarPlayerForNowPlayingItem = async (nowPlayingItem: NowPlayingItem) => {
  // TODO: Android implementation
}

