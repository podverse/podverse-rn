import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import Config from 'react-native-config'
import Share from 'react-native-share'
import { getGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { navigateToEpisodeScreenWithItem, navigateToPodcastScreenWithItem } from '../lib/navigate'
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
  config: {
    handleDismiss: any
    handleDownload: any
    handleDeleteClip: any
    includeGoToPodcast?: boolean
    includeGoToEpisode?: boolean | string
  }
) => {
  if (!item || !item.episodeId) return

  const { handleDismiss, handleDownload, handleDeleteClip, includeGoToPodcast, includeGoToEpisode } = config || {}
  const globalState = getGlobal()
  const isDownloading = globalState.downloadsActive && globalState.downloadsActive[item.episodeId]
  const downloadingText = isDownloading ? translate('Downloading Episode') : translate('Download')
  const isDownloaded = globalState.downloadedEpisodeIds[item.episodeId]
  const buttons = []
  const loggedInUserId = safelyUnwrapNestedVariable(() => globalState.session?.userInfo?.id, '')
  const isLoggedIn = safelyUnwrapNestedVariable(() => globalState.session?.isLoggedIn, '')
  const globalTheme = safelyUnwrapNestedVariable(() => globalState.globalTheme, {})

  if (item.ownerId && item.ownerId === loggedInUserId) {
    buttons.push(
      {
        accessibilityHint: translate('ARIA HINT - edit this clip'),
        key: PV.Keys.edit_clip,
        text: translate('Edit Clip'),
        onPress: async () => {
          const { darkTheme } = require('../styles')
          const isDarkMode = globalState.globalTheme === darkTheme
          await handleDismiss()
          const shouldPlay = false
          await loadItemAndPlayTrack(item, shouldPlay)
          await navigation.navigate(PV.RouteNames.PlayerScreen, { isDarkMode })
          setTimeout(() => {
            (async () => {
              const initialProgressValue = await PVTrackPlayer.getTrackPosition()
              navigation.navigate(PV.RouteNames.MakeClipScreen, {
                initialProgressValue,
                initialPrivacy: item.isPublic,
                isEditing: true,
                isLoggedIn,
                globalTheme
              })
            })()
          }, 1000)
        }
      },
      {
        accessibilityHint: translate('ARIA HINT - delete this clip'),
        key: PV.Keys.delete_clip,
        text: translate('Delete Clip'),
        onPress: async () => {
          await handleDismiss()
          await handleDeleteClip(item.clipId)
        }
      }
    )
  }

  if (isDownloaded) {
    buttons.push({
      accessibilityHint: translate('ARIA HINT - play'),
      key: PV.Keys.play,
      text: translate('Play'),
      onPress: async () => {
        await handleDismiss()
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
      }
    })
  } else {
    buttons.push({
      accessibilityHint: translate('ARIA HINT - stream'),
      key: PV.Keys.stream,
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
        accessibilityHint: translate('ARIA HINT - download this episode'),
        key: PV.Keys.download,
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

  if (!item.addByRSSPodcastFeedUrl) {
    buttons.push(
      {
        accessibilityHint: translate('ARIA HINT - add this next in your queue'),
        key: PV.Keys.queue_next,
        text: translate('Queue Next'),
        onPress: async () => {
          await addQueueItemNext(item)
          await handleDismiss()
        }
      },
      {
        accessibilityHint: translate('ARIA HINT - add this last in your queue'),
        key: PV.Keys.queue_last,
        text: translate('Queue Last'),
        onPress: async () => {
          await addQueueItemLast(item)
          await handleDismiss()
        }
      }
    )

    if (!Config.DISABLE_ADD_TO_PLAYLIST && isLoggedIn) {
      buttons.push({
        accessibilityHint: translate('ARIA HINT - add to your playlist'),
        key: PV.Keys.add_to_playlist,
        text: translate('Add to Playlist'),
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
        accessibilityHint: translate('ARIA HINT - share'),
        key: PV.Keys.share,
        text: translate('Share'),
        onPress: async () => {
          try {
            const urlsWeb = safelyUnwrapNestedVariable(() => globalState.urlsWeb, {})
            let url = ''
            let title = ''

            if (item.clipId) {
              url = urlsWeb.clip + item.clipId
              title = item.clipTitle ? item.clipTitle : translate('Untitled Clip –')
              title += ` ${item.podcastTitle} – ${item.episodeTitle} – ${translate('clip shared using brandName')}`
            } else if (item.episodeId) {
              url = urlsWeb.episode + item.episodeId
              title += `${item.podcastTitle} – ${item.episodeTitle} – ${translate('shared using brandName')}`
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
      accessibilityHint: translate('ARIA HINT - delete this downloaded episode'),
      key: PV.Keys.delete_episode,
      text: translate('Delete Episode'),
      onPress: async () => {
        removeDownloadedPodcastEpisode(item.episodeId)
        await handleDismiss()
      }
    })
  }

  if (includeGoToPodcast) {
    buttons.push({
      accessibilityHint: translate('ARIA HINT - go to this podcast'),
      key: PV.Keys.go_to_podcast,
      text: translate('Go to Podcast'),
      onPress: async () => {
        await handleDismiss()
        navigateToPodcastScreenWithItem(navigation, item)
      }
    })
  }

  if (includeGoToEpisode) {
    buttons.push({
      accessibilityHint: translate('ARIA HINT - go to this episode'),
      key: PV.Keys.go_to_episode,
      text: translate('Go to Episode'),
      onPress: async () => {
        await handleDismiss()
        navigateToEpisodeScreenWithItem(navigation, item)
      }
    })
  }

  return buttons
}

const hasTriedStreamingWithoutWifiAlert = async (handleDismiss: any, navigation: any, download: boolean) => {
  const shouldDownloadWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
  if (shouldDownloadWifiOnly !== 'TRUE') {
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
    translate('No Wifi Connection'),
    `You cannot ${download ? 'download' : 'stream'} without a Wifi connection.
    To allow ${download ? 'downloading' : 'streaming'} with your data plan, go to your Settings page.`,
    [
      {
        text: translate('Cancel'),
        style: 'cancel',
        onPress: handleDismiss
      },
      {
        text: translate('Go to Settings'),
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
