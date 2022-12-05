import { Episode, NowPlayingItem, Podcast } from 'podverse-shared';
import { CarPlay, ListTemplate, NowPlayingTemplate, TabBarTemplate } from 'react-native-carplay';
import { ListItem } from 'react-native-carplay/lib/interfaces/ListItem';
import { TemplateConfig } from 'react-native-carplay/lib/templates/Template';
import { getGlobal } from 'reactn'
import { getHistoryItems } from '../../state/actions/userHistoryItem';
import { translate } from '../i18n';
import { downloadImageFile, getSavedImageUri } from '../storage';
import { readableDate } from '../utility';
import { getEpisodesForPodcast, loadEpisodeInPlayer, loadNowPlayingItemInPlayer } from './helpers';


/* Initialize */

export const registerCarModule = (onConnect, onDisconnect) => {
  CarPlay.registerOnConnect(onConnect);
  CarPlay.registerOnDisconnect(onDisconnect);
}

export const unregisterCarModule = (onConnect, onDisconnect) => { 
  CarPlay.unregisterOnConnect(onConnect);
  CarPlay.unregisterOnDisconnect(onDisconnect);
}

/* Root View */

export const showRootView = async (subscribedPodcasts: Podcast[], historyItems: any[], queueItems: any[]) => {
  const pListTab = await podcastsListTab(subscribedPodcasts)
  const qListTab = await queueItemsListTab(queueItems)
  const hListTab = await historyItemsListTab(historyItems)

  const tabBarTemplate = new TabBarTemplate({
    templates: [pListTab, qListTab, hListTab],
    onTemplateSelect(e: any) {
      if(e.config.title === "Podcasts") {
        handleCarPlayPodcastsUpdate()
      } else if (e.config.title === "Queue") {
        handleCarPlayQueueUpdate()
      } else if (e.config.title === "History") {
        refreshHistory()
      }
    }
  })

  CarPlay.setRootTemplate(tabBarTemplate)
}

/* Podcasts Tab */

let podcastsList: ListTemplate

const podcastsListTab = async (subscribedPodcasts: Podcast[]) => {
  const listItems = await generatePodcastListItems(subscribedPodcasts)

  podcastsList = new ListTemplate({
    sections: [
      {
        header: translate('Subscribed'),
        items: listItems
      }
    ],
    title: translate('Podcasts'),
    tabSystemImg: 'music.note.list',
    onItemSelect: async (item) => {
      const { subscribedPodcasts } = getGlobal()
      const podcast = subscribedPodcasts[item.index]
      const [episodes] = await getEpisodesForPodcast(podcast)
      showEpisodesList(podcast, episodes)
    }
  })

  return podcastsList
}

export const handleCarPlayPodcastsUpdate = async () => {
  if (podcastsList) {
    const { subscribedPodcasts } = getGlobal()
    const listItems = await generatePodcastListItems(subscribedPodcasts)

    podcastsList.updateSections([
      {
        header: translate('Subscribed'),
        items: listItems
      }
    ])
  }
}

const generatePodcastListItems = async (subscribedPodcasts: Podcast[]) => {
  const listItems: ListItem[] = []

  for (const podcast of subscribedPodcasts) {
    const listItem = await createCarPlayPodcastListItem(podcast)
    listItems.push(listItem)
  }

  return listItems
}

const createCarPlayPodcastListItem = async (podcast: Podcast) => {
  const imgUrl = await getDownloadedImageUrl(podcast?.shrunkImageUrl || podcast?.imageUrl)

  return {
    text: podcast.title || translate('Untitled Podcast'),
    imgUrl
  }
}

/* Podcast Episodes Tab */

const showEpisodesList = (podcast: Podcast, episodes: Episode[]) => {
  const episodesList = new ListTemplate({
    sections: [
      {
        header: podcast.title || translate('Untitled Podcast'),
        items: episodes.map((episode) => {
          // const imgUrl =  episode.imageUrl
          //   || podcast.shrunkImageUrl
          //   || podcast.imageUrl
          //   || null

          const pubDate =
            (episode?.liveItem?.start && readableDate(episode.liveItem.start))
            || (episode.pubDate && readableDate(episode.pubDate))
            || ''

          return {
            text: episode.title || translate('Untitled Episode'),
            detailText: pubDate
          }}),
      },
    ],
    onItemSelect: ({index}) => showCarPlayerForEpisode(episodes[index], podcast)
  });

  CarPlay.pushTemplate(episodesList)
}

/* Queue Tab */

let queueList: ListTemplate 

const queueItemsListTab = async (queueItems: NowPlayingItem[]) => {
  const listItems = await generateNPIListItems(queueItems)

  queueList = new ListTemplate({
    sections: [
      {
        header: '',
        items: listItems
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

export const handleCarPlayQueueUpdate = async () => {
  if (queueList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.queueItems || []
    const listItems = await generateNPIListItems(updatedItems)
    queueList.updateSections([
      {
        header: '',
        items: listItems
      }
    ])
  }
}

/* History Tab */

let historyList: ListTemplate

const historyItemsListTab = async (historyItems: NowPlayingItem[]) => {
  const listItems = await generateNPIListItems(historyItems)

  historyList = new ListTemplate({
    sections: [
      {
        header: translate('Recently Played'),
        items: listItems
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

export const handleCarPlayHistoryUpdate = async () => {
  if (historyList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.historyItems || []
    const listItems = await generateNPIListItems(updatedItems)
    historyList.updateSections([
      {
        header: '',
        items: listItems
      }
    ])
  }
}

const refreshHistory = () => {
  (async () => {
    const page = 1
    const existingItems: any[] = []
    await getHistoryItems(page, existingItems)
    handleCarPlayHistoryUpdate()
  })()
}

/* Player Helpers */

const nowPlayingTemplateConfig = (id:string) : TemplateConfig => ({
  id,
  onWillDisappear: () => {
    handleCarPlayQueueUpdate()
    handleCarPlayHistoryUpdate()
  }}
)

export const showCarPlayerForEpisode = async (episode: Episode, podcast: Podcast) => {
  await loadEpisodeInPlayer(episode, podcast)
  pushPlayerTemplate()
}

export const showCarPlayerForNowPlayingItem = async (nowPlayingItem: NowPlayingItem) => {
  await loadNowPlayingItemInPlayer(nowPlayingItem)
  pushPlayerTemplate()
}

const pushPlayerTemplate = () => {
  const playerTemplate = new NowPlayingTemplate(nowPlayingTemplateConfig("podverse.NowPlayingTemplate"))
  CarPlay.pushTemplate(playerTemplate)
  CarPlay.enableNowPlaying(true)

  refreshHistory()
}

const generateNPIListItems = async (nowPlayingItems: NowPlayingItem[]) => {
  const listItems: ListItem[] = []

  for (const nowPlayingItem of nowPlayingItems) {
    const listItem = await createCarPlayNPIListItem(nowPlayingItem)
    listItems.push(listItem)
  }

  return listItems
}

const createCarPlayNPIListItem = async (item: NowPlayingItem) => {
  const imgUrl = await getDownloadedImageUrl(
    item?.episodeImageUrl || item?.podcastShrunkImageUrl || item?.podcastImageUrl
  )

  return {
    text: item?.episodeTitle || translate('Untitled Episode'),
    detailText: item?.podcastTitle || translate('Untitled Podcast'),
    imgUrl
  } as ListItem
}

/* Image Helpers */

const getDownloadedImageUrl = async (origImageUrl?: string | null) => {
  let finalImageUrl = null
  if (origImageUrl) {
    try {
      const savedImageResults = await getSavedImageUri(origImageUrl)
      finalImageUrl = savedImageResults.exists ? `file://${savedImageResults.imageUrl}` : origImageUrl
    } catch (error) {
      finalImageUrl = origImageUrl

      // If there was an error loading the image, then download the image file
      // in the background so it can load from downloaded storage next time.
      downloadImageFile(finalImageUrl)

      console.log('carPlayListItems error:', error)
    }
  }

  return finalImageUrl
}
