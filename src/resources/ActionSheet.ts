import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import Config from 'react-native-config'
import Share from 'react-native-share'
import { getGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { IActionSheet } from '../resources/Interfaces'
import { PVTrackPlayer } from '../services/player'
import { removeDownloadedPodcastEpisode } from '../state/actions/downloads'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { addQueueItemLast, addQueueItemNext } from '../state/actions/queue'
import { PV } from './PV'

const mediaMoreButtons = (
  item: any = {},
  navigation: any,
  handleDismiss: any,
  handleDownload: any,
  handleDeleteClip: any,
  includeGoToPodcast?: boolean,
  includeGoToEpisode?: boolean
) => {
  if (!item || !item.episodeId) return

  const globalState = getGlobal()
  const isDownloading = globalState.downloadsActive && globalState.downloadsActive[item.episodeId]
  const downloadingText = isDownloading ? 'Downloading' : 'Download'
  const isDownloaded = globalState.downloadedEpisodeIds[item.episodeId]
  const buttons = []
  const loggedInUserId = safelyUnwrapNestedVariable(() => globalState.session.userInfo.id, '')
  const isLoggedIn = safelyUnwrapNestedVariable(() => globalState.session.isLoggedIn, '')
  const globalTheme = safelyUnwrapNestedVariable(() => globalState.globalTheme, {})

  if (item.ownerId && item.ownerId === loggedInUserId) {
    buttons.push(
      {
        key: 'editClip',
        text: 'Edit Clip',
        onPress: async () => {
          const { darkTheme } = require('../styles')
          const isDarkMode = globalState.globalTheme === darkTheme
          await handleDismiss()
          const shouldPlay = false
          await loadItemAndPlayTrack(item, shouldPlay)
          await navigation.navigate(PV.RouteNames.PlayerScreen, { isDarkMode })
          setTimeout(async () => {
            const initialProgressValue = await PVTrackPlayer.getPosition()
            navigation.navigate(PV.RouteNames.MakeClipScreen, {
              initialProgressValue,
              initialPrivacy: item.isPublic,
              isEditing: true,
              isLoggedIn,
              globalTheme
            })
          }, 1000)
        }
      },
      {
        key: 'deleteClip',
        text: 'Delete Clip',
        onPress: async () => {
          await handleDismiss()
          await handleDeleteClip(item.clipId)
        }
      }
    )
  }

  if (isDownloaded) {
    buttons.push({
      key: 'play',
      text: 'Play',
      onPress: async () => {
        await handleDismiss()
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
      }
    })
  } else {
    buttons.push({
      key: 'stream',
      text: translate('Stream'),
      onPress: async () => {
        const showAlert = await hasTriedStreamingWithoutWifiAlert(handleDismiss, navigation, false)
        if (showAlert) return

        await handleDismiss()
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
      }
    })

    if (handleDownload) {
      buttons.push({
        key: 'download',
        text: downloadingText,
        isDownloading,
        onPress: async () => {
          const showAlert = await hasTriedDownloadingWithoutWifiAlert(handleDismiss, navigation, true)
          if (showAlert) return

          if (isDownloading) {
            await handleDismiss()
            navigation.navigate(PV.RouteNames.DownloadsScreen)
          } else {
            await handleDismiss()
            handleDownload()
          }
        }
      })
    }
  }

  buttons.push(
    {
      key: 'queueNext',
      text: 'Queue: Next',
      onPress: async () => {
        await addQueueItemNext(item)
        await handleDismiss()
      }
    },
    {
      key: 'queueLast',
      text: 'Queue: Last',
      onPress: async () => {
        await addQueueItemLast(item)
        await handleDismiss()
      }
    }
  )

  if (!item.addByRSSPodcastFeedUrl) {
    if (!Config.DISABLE_ADD_TO_PLAYLIST) {
      buttons.push({
        key: 'addToPlaylist',
        text: 'Add to Playlist',
        onPress: async () => {
          await handleDismiss()
          navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, {
            ...(item.clipId ? { mediaRefId: item.clipId } : { episodeId: item.episodeId })
          })
        }
      })
    }

    if (!Config.DISABLE_SHARE) {
      buttons.push({
        key: 'share',
        text: 'Share',
        onPress: async () => {
          try {
            let url = ''
            let title = ''
            if (item.clipId) {
              url = PV.URLs.clip + item.clipId
              title = item.clipTitle ? item.clipTitle : 'untitled clip –'
              title += ` ${item.podcastTitle} – ${item.episodeTitle} – clip shared using Podverse`
            } else if (item.episodeId) {
              url = PV.URLs.episode + item.episodeId
              title += `${item.podcastTitle} – ${item.episodeTitle} – shared using Podverse`
            }
            await Share.open({
              title,
              subject: title,
              url
            })
          } catch (error) {
            console.log(error)
          }
          await handleDismiss()
        }
      })
    }
  }

  if (isDownloaded) {
    buttons.push({
      key: 'deleteEpisode',
      text: 'Delete Episode',
      onPress: async () => {
        removeDownloadedPodcastEpisode(item.episodeId)
        await handleDismiss()
      }
    })
  }

  if (includeGoToPodcast) {
    buttons.push({
      key: 'goToPodcast',
      text: 'Go to Podcast',
      onPress: async () => {
        await handleDismiss()
        // first navigate to the PodcastScreen, then goBack to the PodcastsScreen,
        // then back again to the PodcastScreen to force it to rerender with the new podcast.
        // TODO: This could apparently be done without goBack if we update to React Navigation 5
        // tslint:disable-next-line:max-line-length
        // https://stackoverflow.com/questions/52805879/re-render-component-when-navigating-the-stack-with-react-navigation
        navigation.navigate(PV.RouteNames.PodcastScreen)
        navigation.goBack(null)
        navigation.navigate(PV.RouteNames.PodcastScreen, {
          addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
          podcastId: item.podcastId
        })
      }
    })
  }

  if (includeGoToEpisode) {
    buttons.push({
      key: 'goToEpisode',
      text: 'Go to Episode',
      onPress: async () => {
        await handleDismiss()
        // TODO: This could apparently be done without goBack if we update to React Navigation 5
        // tslint:disable-next-line:max-line-length
        // https://stackoverflow.com/questions/52805879/re-render-component-when-navigating-the-stack-with-react-navigation
        navigation.navigate(PV.RouteNames.PodcastScreen)
        navigation.goBack(null)
        navigation.navigate(PV.RouteNames.PodcastScreen, {
          addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl,
          podcastId: item.podcastId,
          navToEpisodeWithId: item.episodeId
        })
      }
    })
  }

  return buttons
}

const hasTriedStreamingWithoutWifiAlert = async (handleDismiss: any, navigation: any, download: boolean) => {
  const shouldDownloadWithoutWifi = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
  if (shouldDownloadWithoutWifi !== 'TRUE') {
    return false
  }

  const netInfoState = await NetInfo.fetch()
  const hasTried = await AsyncStorage.getItem(PV.Keys.HAS_TRIED_STREAMING_WITHOUT_WIFI)
  const showAlert = netInfoState.type !== 'wifi' && !hasTried
  if (showAlert) {
    await AsyncStorage.setItem(PV.Keys.HAS_TRIED_STREAMING_WITHOUT_WIFI, 'TRUE')
    hasTriedWithoutWifiAlert(handleDismiss, navigation, download)
  }
  return showAlert
}

const hasTriedDownloadingWithoutWifiAlert = async (handleDismiss: any, navigation: any, download: boolean) => {
  const shouldDownloadWithoutWifi = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
  if (shouldDownloadWithoutWifi !== 'TRUE') {
    return false
  }

  const netInfoState = await NetInfo.fetch()
  const hasTried = await AsyncStorage.getItem(PV.Keys.HAS_TRIED_DOWNLOADING_WITHOUT_WIFI)
  const showAlert = netInfoState.type !== 'wifi' && !hasTried
  if (showAlert) {
    await AsyncStorage.setItem(PV.Keys.HAS_TRIED_DOWNLOADING_WITHOUT_WIFI, 'TRUE')
    hasTriedWithoutWifiAlert(handleDismiss, navigation, download)
  }
  return showAlert
}

const hasTriedWithoutWifiAlert = (handleDismiss: any, navigation: any, download: boolean) => {
  Alert.alert(
    'No Wifi Connection',
    `You cannot ${download ? 'download' : 'stream'} without a Wifi connection.
    To allow ${download ? 'downloading' : 'streaming'} with your data plan, go to your Settings page.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: handleDismiss
      },
      {
        text: 'Go to Settings',
        onPress: async () => {
          await handleDismiss()
          navigation.navigate(PV.RouteNames.SettingsScreen)
        }
      }
    ]
  )
}

export const ActionSheet: IActionSheet = {
  media: {
    moreButtons: mediaMoreButtons
  }
}
