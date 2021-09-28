import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import Config from 'react-native-config'
import Share from 'react-native-share'
import { getGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { navigateToEpisodeScreenWithItem,
  navigateToEpisodeScreenWithItemInCurrentStack, navigateToPodcastScreenWithItem } from '../lib/navigate'
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
    includeGoToEpisodeInEpisodesStack?: boolean | string
    includeGoToEpisodeInCurrentStack?: boolean
  },
  itemType: 'podcast' | 'episode' | 'clip' | 'chapter' | 'playlist' | 'profile'
) => {
  if (!item || !item.episodeId) return

  const { handleDismiss, handleDownload, handleDeleteClip, includeGoToPodcast, includeGoToEpisodeInEpisodesStack,
    includeGoToEpisodeInCurrentStack } = config || {}
  const globalState = getGlobal()
  const isDownloading = globalState.downloadsActive && globalState.downloadsActive[item.episodeId]
  const downloadingText = isDownloading ? translate('Downloading Episode') : translate('Download')
  const downloadingAccessibilityHint = isDownloading ?  '' :  translate('ARIA HINT - download this episode')
  const isDownloaded = globalState.downloadedEpisodeIds[item.episodeId]
  const buttons = []
  const loggedInUserId = safelyUnwrapNestedVariable(() => globalState.session?.userInfo?.id, '')
  const isLoggedIn = safelyUnwrapNestedVariable(() => globalState.session?.isLoggedIn, '')
  const globalTheme = safelyUnwrapNestedVariable(() => globalState.globalTheme, {})

  if (item.ownerId && item.ownerId === loggedInUserId) {
    buttons.push(
      {
        accessibilityLabel: translate('Edit Clip'),
        key: PV.Keys.edit_clip,
        text: translate('Edit Clip'),
        onPress: async () => {
          const { darkTheme } = require('../styles')
          const isDarkMode = globalState.globalTheme === darkTheme
          await handleDismiss()
          const shouldPlay = false
          const forceUpdateOrderDate = false
          const setCurrentItemNextInQueue = true
          await loadItemAndPlayTrack(item, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
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
        accessibilityLabel: translate('Delete Clip'),
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
      accessibilityLabel: translate('Play'),
      key: PV.Keys.play,
      text: translate('Play'),
      onPress: async () => {
        await handleDismiss()
        const shouldPlay = true
        const forceUpdateOrderDate = false
        const setCurrentItemNextInQueue = true
        await loadItemAndPlayTrack(item, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
      }
    })
  } else {
    buttons.push({
      accessibilityHint: itemType === 'episode'
        ? translate('ARIA HINT - stream this episode')
        : itemType === 'chapter'
          ? translate('ARIA HINT - stream this chapter') 
          : translate('ARIA HINT - stream this clip'),
      accessibilityLabel: translate('Stream'),
      key: PV.Keys.stream,
      text: translate('Stream'),
      onPress: async () => {
        const showAlert = await hasTriedStreamingWithoutWifiAlert(handleDismiss, navigation, false)
        if (showAlert) return

        await handleDismiss()
        const shouldPlay = true
        const forceUpdateOrderDate = false
        const setCurrentItemNextInQueue = true
        await loadItemAndPlayTrack(item, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
      }
    })

    if (handleDownload) {
      buttons.push({
        accessibilityHint: downloadingAccessibilityHint,
        accessibilityLabel: downloadingText,
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
            handleDownload(item)
          }
        }
      })
    }
  }

  if (!item.addByRSSPodcastFeedUrl) {
    buttons.push(
      {
        accessibilityHint: itemType === 'episode'
          ? translate('ARIA HINT - add this episode next in your queue')
          : itemType === 'clip'
            ? translate('ARIA HINT - add this clip next in your queue')
            : translate('ARIA HINT - add this chapter next in your queue'),
        accessibilityLabel: translate('ARIA LABEL - Queue Next'),
        key: PV.Keys.queue_next,
        text: translate('Queue Next'),
        onPress: async () => {
          await addQueueItemNext(item)
          await handleDismiss()
        }
      },
      {
        accessibilityHint: itemType === 'episode'
          ? translate('ARIA HINT - add this episode last in your queue')
          : itemType === 'clip'
            ? translate('ARIA HINT - add this clip last in your queue')
            : translate('ARIA HINT - add this chapter last in your queue'),
        accessibilityLabel: translate('ARIA LABEL - Queue Last'),
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
        accessibilityHint: itemType === 'episode'
          ? translate('ARIA HINT - add this episode to a playlist')
          : itemType === 'clip'
            ? translate('ARIA HINT - add this clip to a playlist')
            : translate('ARIA HINT - add this chapter to a playlist'),
        accessibilityLabel: translate('Add to Playlist'),
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
      const accessibilityHint = itemType === 'podcast'
        ? translate('ARIA HINT - share this podcast')
        : itemType === 'episode'
          ? translate('ARIA HINT - share this episode')
          : itemType === 'clip'
            ? translate('ARIA HINT - share this clip')
            : itemType === 'chapter'
              ? translate('ARIA HINT - share this chapter')
              : itemType === 'playlist'
                ? translate('ARIA HINT - share this playlist')
                : itemType === 'profile'
                  ? translate('ARIA HINT - share this profile')
                  : translate('ARIA HINT - share this item')
      buttons.push({
        accessibilityHint,
        accessibilityLabel: translate('Share'),
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
      accessibilityLabel: translate('Delete Episode'),
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
      accessibilityLabel: translate('Go to Podcast'),
      key: PV.Keys.go_to_podcast,
      text: translate('Go to Podcast'),
      onPress: async () => {
        await handleDismiss()
        navigateToPodcastScreenWithItem(navigation, item)
      }
    })
  }

  if (includeGoToEpisodeInEpisodesStack || includeGoToEpisodeInCurrentStack) {
    buttons.push({
      accessibilityLabel: translate('Go to Episode'),
      key: PV.Keys.go_to_episode,
      text: translate('Go to Episode'),
      onPress: async () => {
        await handleDismiss()
        if (includeGoToEpisodeInEpisodesStack) {
          navigateToEpisodeScreenWithItem(navigation, item)
        } else if (includeGoToEpisodeInCurrentStack) {
          navigateToEpisodeScreenWithItemInCurrentStack(navigation, item, includeGoToPodcast)
        }
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
