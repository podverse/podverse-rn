import { Episode, NowPlayingItem, Podcast } from 'podverse-shared';
import { CarPlay, ListTemplate, NowPlayingTemplate, TabBarTemplate } from 'react-native-carplay';
import { ListItem } from 'react-native-carplay/lib/interfaces/ListItem';
import { TemplateConfig } from 'react-native-carplay/lib/templates/Template';
import { getGlobal } from 'reactn'
import { getHistoryItems } from '../../state/actions/userHistoryItem';
import { errorLogger } from '../logger';
import { translate } from '../i18n';
import { downloadImageFile, getSavedImageUri } from '../storage';
import { readableDate } from '../utility';
import { getEpisodesForPodcast, loadEpisodeInPlayer, loadNowPlayingItemInPlayer } from './helpers';


/* Initialize */

export const registerCarModule = (onConnect: any, onDisconnect: any) => {
  CarPlay.registerOnConnect(onConnect);
  CarPlay.registerOnDisconnect(onDisconnect);
}

export const unregisterCarModule = (onConnect: any, onDisconnect: any) => { 
  CarPlay.unregisterOnConnect(onConnect);
  CarPlay.unregisterOnDisconnect(onDisconnect);
}

/* Root View */

export const showRootView = () => {
  const pListTab = podcastsListTab()
  const qListTab = queueItemsListTab()
  const hListTab = historyItemsListTab()

  const tabBarTemplate = new TabBarTemplate({
    templates: [pListTab, qListTab, hListTab],
    onTemplateSelect(e: any) {
      if (e.config.title === 'Podcasts') {
        handleCarPlayPodcastsUpdate()
      } else if (e.config.title === 'Queue') {
        handleCarPlayQueueUpdate()
      } else if (e.config.title === 'History') {
        refreshHistory()
      }
    }
  })

  CarPlay.setRootTemplate(tabBarTemplate)
}

/* Podcasts Tab */

let podcastsList: ListTemplate
let podcastsListLoaded = false

let episodes: any[] = []

const podcastsListTab = () => {
  podcastsList = new ListTemplate({
    sections: [
      {
        header: '',
        items: []
      }
    ],
    title: translate('Podcasts'),
    emptyViewTitleVariants: ["Loading..."],
    tabSystemImg: 'music.note.list',
    onItemSelect: async (item) => {
      if(item.disabled) {
        return
      }

      if (podcastsListLoaded) {
        const { subscribedPodcasts } = getGlobal()
        const podcast = subscribedPodcasts[item.index]
        showEpisodesList(podcast)

        const results = await getEpisodesForPodcast(podcast)
        episodes = results[0]
        handleCarPlayEpisodesUpdate(podcast)
      }
    }
  })

  return podcastsList
}

export const handleCarPlayPodcastsUpdate = async () => {
  if (podcastsList) {
    podcastsListLoaded = true
    const { subscribedPodcasts } = getGlobal()
    const listItems = await generatePodcastListItems(subscribedPodcasts)
    if (!listItems.length) {
      listItems.push(getEmptyCellWithTitle("No subscribed Podcasts"))
    }

    podcastsList.updateSections([
      {
        header: '',
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
  } as ListItem
}

/* Podcast Episodes Tab */

let episodesList: ListTemplate

const showEpisodesList = (podcast: Podcast) => {
  episodesList = new ListTemplate({
    sections: [
      {
        header: podcast.title || translate('Untitled Podcast'),
        items: []
      }
    ],
    emptyViewTitleVariants: ["Loading..."],
    onItemSelect: async ({index, disabled}) => {
      if(disabled) {
        return
      }
      
      await showCarPlayerForEpisode(episodes[index], podcast)
    }
  });

  CarPlay.pushTemplate(episodesList)
}

const handleCarPlayEpisodesUpdate = (podcast: Podcast) => {
  if (episodesList) {
    const listItems = generateEpisodesListItems()

    episodesList.updateSections([
      {
        header: podcast.title || translate('Untitled Podcast'),
        items: listItems
      }
    ])
  }
}

const generateEpisodesListItems = () => {
  return episodes.map((episode) => {
    const pubDate =
      (episode?.liveItem?.start && readableDate(episode.liveItem.start))
      || (episode.pubDate && readableDate(episode.pubDate))
      || ''

    return {
      text: episode.title || translate('Untitled Episode'),
      detailText: pubDate
    }
  })
}

/* Queue Tab */

let queueList: ListTemplate 

const queueItemsListTab = () => {
  queueList = new ListTemplate({
    sections: [
      {
        header: '',
        items: []
      }
    ],
    title: translate('Queue'),
    emptyViewTitleVariants: ["Loading..."],
    tabSystemImg: 'list.bullet',
    onItemSelect: async (item) => {
      if(item.disabled) {
        return
      }

      const { session } = getGlobal()
      const updatedItems = session?.userInfo?.queueItems || []
      const nowPlayingItem = updatedItems[item.index]
      await showCarPlayerForNowPlayingItem(nowPlayingItem)
    }
  })

  return queueList
}

export const handleCarPlayQueueUpdate = async () => {
  if (queueList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.queueItems || []
    const listItems = await generateNPIListItems(updatedItems)
    if (!listItems.length) {
      listItems.push(getEmptyCellWithTitle("No items in your queue"))
    }

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

const historyItemsListTab = () => {
  historyList = new ListTemplate({
    sections: [
      {
        header: '',
        items: []
      }
    ],
    title: translate('History'),
    emptyViewTitleVariants: ["Loading..."],
    tabSystemImg: 'timer',
    onItemSelect: async (item) => {
      if(item.disabled) {
        return
      }

      const { session } = getGlobal()
      const updatedItems = session?.userInfo?.historyItems || []
      const nowPlayingItem = updatedItems[item.index]
      await showCarPlayerForNowPlayingItem(nowPlayingItem)
    }
  })

  return historyList
}

export const handleCarPlayHistoryUpdate = async () => {
  if (historyList) {
    const { session } = getGlobal()
    const updatedItems = session?.userInfo?.historyItems || []
    // Limit historyItems to the most recent 20 items, for performance reasons.
    const limitedItems = updatedItems.slice(0, 20)
    const listItems = await generateNPIListItems(limitedItems)
    if (!listItems.length) {
      listItems.push(getEmptyCellWithTitle("No items in your history"))
    }

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
    item?.podcastShrunkImageUrl || item?.podcastImageUrl
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

      errorLogger('carPlayListItems error:', error)
    }
  }

  return finalImageUrl
}

/* Loading Cell Helper */
const getEmptyCellWithTitle = (title: string): ListItem => ({
    text: title,
    showsDisclosureIndicator: false,
    disabled: true
})
