import AsyncStorage from '@react-native-community/async-storage'
import * as rssParser from 'react-native-rss-parser'
import { PV } from '../resources'

/*
addByRSSPodcasts: [addByRSSPodcast]
addByRSSPodcast: object {
  addByFeedUrl: string,
  episodes: [episode],
  ...other podcast properties
}
*/

export const getAddByRSSPodcasts = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.ADD_BY_RSS_PODCASTS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    console.log('getAddByRSSPodcasts', error)
    return []
  }
}

const setAddByRSSPodcasts = async (podcasts: any[]) => {
  if (Array.isArray(podcasts)) {
    await AsyncStorage.setItem(
      PV.Keys.ADD_BY_RSS_PODCASTS,
      JSON.stringify(podcasts)
    )
  }
}

export const parseAllAddByRSSPodcasts = async () => {
  const rssPodcasts = await getAddByRSSPodcasts()
  const parsedPodcasts = []
  for (const rssPodcast of rssPodcasts) {
    try {
      const parsedPodcast = await parseAddByRSSPodcast(rssPodcast.addByFeedUrl) as any
      if (parsedPodcast) {
        parsedPodcasts.push(parsedPodcast)
      }
    } catch (error) {
      console.log('parseAllAddByRSSPodcasts', error)
    }
  }

  for (const parsedPodcast of parsedPodcasts) {
    const index = rssPodcasts.findIndex((rssPodcast: any) => rssPodcast.addByFeedUrl === parsedPodcast.addByFeedUrl)
    if (index || index === 0) {
      rssPodcasts[index] = parsedPodcast
    } else {
      rssPodcasts.push(parsedPodcast)
    }
  }

  await setAddByRSSPodcasts(rssPodcasts)

  return rssPodcasts
}

export const parseAddByRSSPodcast = async (feedUrl: string) => {
  return fetch(feedUrl)
    .then((response) => response.text())
    .then((responseData) => rssParser.parse(responseData))
    .then((rss) => {
      console.log(rss.title)
      // console.log(rss.items)
    })
}

const addParsedAddByRSSPodcast = async (parsedPodcast: any) => {
  const rssPodcasts = await getAddByRSSPodcasts()
  const index = rssPodcasts.findIndex((rssPodcast: any) => rssPodcast.addByFeedUrl === parsedPodcast.addByFeedUrl)
  if (index || index === 0) {
    rssPodcasts[index] = { addFeedByUrl: parsedPodcast.addByFeedUrl }
  } else {
    rssPodcasts.push({ addFeedByUrl: parsedPodcast.addByFeedUrl })
  }
  await setAddByRSSPodcasts(rssPodcasts)
}