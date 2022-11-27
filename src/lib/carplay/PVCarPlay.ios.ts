import { Episode, NowPlayingItem, Podcast } from 'podverse-shared';
import { CarPlay, ListTemplate, NowPlayingTemplate, TabBarTemplate } from 'react-native-carplay';
import { getGlobal } from 'reactn'
import { PV } from '../../resources';
import PVEventEmitter from '../../services/eventEmitter'
import { getHistoryItems } from '../../state/actions/userHistoryItem';
import { translate } from '../i18n';
import { getEpisodesForPodcast, loadEpisodeInPlayer, loadNowPlayingItemInPlayer } from './helpers';

/* Constants */

// This timeout is a work-around for asynchronous state loading issues in background tabs.
const stateUpdateTimeout = 10000

/* Initialize */

export const registerCarModule = (onConnect, onDisconnect) => {
  CarPlay.registerOnConnect(onConnect);
  CarPlay.registerOnDisconnect(onDisconnect);

  PVEventEmitter.on(PV.Events.QUEUE_HAS_UPDATED, handleQueueUpdateTwice)
}

export const unregisterCarModule = (onConnect, onDisconnect) => { 
  CarPlay.unregisterOnConnect(onConnect);
  CarPlay.unregisterOnDisconnect(onDisconnect);

  PVEventEmitter.removeListener(PV.Events.QUEUE_HAS_UPDATED, handleQueueUpdateTwice)
}

/* Root View */

export const showRootView = (podcasts: Podcast[], historyItems: any[], queueItems: any[]) => {
  const tabBarTemplate = new TabBarTemplate({
    templates: [podcastsListTab(podcasts), historyItemsListTab(historyItems), queueItemsListTab(queueItems)],
    onTemplateSelect(e: any) {
      console.log('selected', e)
    }
  })

  CarPlay.setRootTemplate(tabBarTemplate)
}

/* Podcasts Tab */

const podcastsListTab = (podcasts: Podcast[]) => {
  const subscribedList = new ListTemplate({
    sections: [
      {
        header: translate('Subscribed'),
        items: podcasts.map((podcast) => {
          return {
            text: podcast.title || translate('Untitled Podcast'), 
            imgUrl: podcast.shrunkImageUrl || podcast.imageUrl || null
          }}),
      },
    ],
    title: translate('Podcasts'),
    tabSystemImg:"music.note.list",
    onItemSelect: async (item) => {
      const podcast = podcasts[item.index]
      const [episodes] = await getEpisodesForPodcast(podcast)
      showEpisodesList(podcast, episodes)
    }
  });

  return subscribedList
}

/* Podcast Episodes Tab */

const showEpisodesList = (podcast: Podcast, episodes: Episode[]) => {
  const episodesList = new ListTemplate({
    sections: [
      {
        header: podcast.title || translate('Untitled Podcast'),
        items: episodes.map((episode) => {
          const imgUrl =  episode.imageUrl
            || podcast.shrunkImageUrl
            || podcast.imageUrl
            || null
          return {
            text: episode.title || translate('Untitled Episode'),
            imgUrl
          }}),
      },
    ],
    onItemSelect: ({index}) => showCarPlayerForEpisode(episodes[index], podcast)
  });

  CarPlay.pushTemplate(episodesList)
}

/* Queue Tab */

let queueList: ListTemplate 

const queueItemsListTab = (queueItems: NowPlayingItem[]) => {
  queueList = new ListTemplate({
    sections: [
      {
        header: '',
        items: queueItems.map((queueItem) => createCarPlayNowPlayingItem(queueItem)),
      },
    ],
    title: translate('Queue'),
    tabSystemImg:"list.bullet",
    onItemSelect: async (item) => {
      const { session } = getGlobal()
      const updatedItems = session?.userInfo?.queueItems || []
      const nowPlayingItem = updatedItems[item.index]
      await showCarPlayerForNowPlayingItem(nowPlayingItem)
    }
  });

  return queueList
}

const handleQueueUpdate = () => {
  if (queueList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.queueItems || []
    queueList.updateSections([
      {
        header: '',
        items: updatedItems.map((queueItem) => createCarPlayNowPlayingItem(queueItem))
      }
    ])
  }
}

const handleQueueUpdateTwice = () => {
  handleQueueUpdate()
  setTimeout(handleQueueUpdate, stateUpdateTimeout)
}

/* History Tab */

let historyList: ListTemplate

const historyItemsListTab = (historyItems: NowPlayingItem[]) => {
  historyList = new ListTemplate({
    sections: [
      {
        header: translate('Recently Played'),
        items: historyItems.map((historyItem) => createCarPlayNowPlayingItem(historyItem))
      }
    ],
    title: translate('History'),
    tabSystemImg:"timer",
    onItemSelect: async (item) => {
      const { session } = getGlobal()
      const updatedItems = session?.userInfo?.historyItems || []
      const nowPlayingItem = updatedItems[item.index]
      await showCarPlayerForNowPlayingItem(nowPlayingItem)
    }
  });

  return historyList
}

const handleHistoryUpdate = () => {
  if (historyList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.historyItems || []
    historyList.updateSections([
      {
        header: '',
        items: updatedItems.map((historyItem) => createCarPlayNowPlayingItem(historyItem))
      }
    ])
  }
}

const refreshHistory = () => {
  (async () => {
    const page = 1
    const existingItems: any[] = []
    await getHistoryItems(page, existingItems)
    handleHistoryUpdate()
  })()
}

/* Player Helpers */

const nowPlayingTemplateConfig = {
  onWillDisappear: () => {
    handleQueueUpdate()
    handleHistoryUpdate()
  }
}

export const showCarPlayerForEpisode = async (episode: Episode, podcast: Podcast) => {
  await loadEpisodeInPlayer(episode, podcast)
  pushPlayerTemplate()
}

export const showCarPlayerForNowPlayingItem = async (nowPlayingItem: NowPlayingItem) => {
  await loadNowPlayingItemInPlayer(nowPlayingItem)
  pushPlayerTemplate()
}

const pushPlayerTemplate = () => {
  const playerTemplate = new NowPlayingTemplate(nowPlayingTemplateConfig)
  CarPlay.pushTemplate(playerTemplate)
  CarPlay.enableNowPlaying(true)

  setTimeout(refreshHistory, stateUpdateTimeout)
}

const createCarPlayNowPlayingItem = (item: NowPlayingItem) => {
  const imgUrl = item?.episodeImageUrl || item?.podcastShrunkImageUrl || item?.podcastImageUrl || null
  return {
    text: item?.episodeTitle || translate('Untitled Episode'),
    detailText: item?.podcastTitle || translate('Untitled Podcast'),
    imgUrl
  }
}
