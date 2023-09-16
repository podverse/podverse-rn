import AsyncStorage from '@react-native-community/async-storage'
import { Episode, NowPlayingItem, Podcast, ValueTag,
  ValueTimeSplit, checkIfIsLightningKeysendValueTag } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../../resources'
import { playerGetPosition } from '../../../services/player'
import { getValueTagsForItemGuidOrFeedGuid } from '../../../services/podcastIndex'
import {
  BoostagramItem,
  extractV4VValueTags,
  getStreamingValueOn,
  v4vDeleteProviderFromStorage,
  v4vGetActiveValueTag,
  v4vGetProvidersConnected,
  v4vGetSenderInfo,
  v4vGetSettings,
  v4vGetTypeMethodKey,
  v4vSetProvidersConnected,
  v4vSetSenderInfo,
  v4vSetSettings
} from '../../../services/v4v/v4v'
import { playerUpdatePlayerState } from '../player'

export type V4VProviderConnectedState = {
  key: string
  address: string
  balance: number
  boostagrams_count: number
  currency: 'BTC'
  fiat_balance_text: string
  fiat_currency: string
  fiat_rate_float: number
  keysend_custom_key: number
  keysend_custom_value: number
  method: 'keysend'
  transactions_count: number
  type: 'lightning'
  unit: 'sat'
}

export type V4VTransactionError = {
  address: string
  message: string
  customKey?: string
  customValue?: string
}

export type V4VTypeMethod = {
  boostAmount: number
  streamingAmount: number
  appBoostAmount: number
  appStreamingAmount: number
  boostagramCharLimit: number
}

export type V4VSenderInfo = {
  name: string
}

export type V4VSettings = {
  typeMethod: {
    lightningKeysend: V4VTypeMethod
  }
}

export const v4vSettingsDefault = {
  typeMethod: {
    lightningKeysend: {
      boostAmount: 1000,
      streamingAmount: 10,
      appBoostAmount: 50,
      appStreamingAmount: 1,
      boostagramCharLimit: 400
    }
  }
}

export const v4vInitialize = async () => {
  const globalState = getGlobal()
  const showLightningIcons = await AsyncStorage.getItem(PV.Keys.V4V_SHOW_LIGHTNING_ICONS)
  const savedSettings = await v4vGetSettings()
  const savedProviders = await v4vInitializeConnectedProviders()
  const savedSenderInfo = await v4vGetSenderInfo()
  const streamingValueOn = await getStreamingValueOn()
  
  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        showLightningIcons,
        settings: savedSettings,
        providers: {
          ...globalState.session.v4v.providers,
          connected: savedProviders
        },
        senderInfo: savedSenderInfo,
        streamingValueOn: !!streamingValueOn
      }
    }
  })
}

/* Lightning Icon helpers */

export const v4vInitializeShowLightningIcon = async () => {
  const showLightningIcons = await AsyncStorage.getItem(PV.Keys.V4V_SHOW_LIGHTNING_ICONS)
  if (showLightningIcons) {
    await v4vSetShowLightningIcons(true)
  }
}

export const v4vSetShowLightningIcons = async (showLightningIcons: boolean) => {
  const globalState = getGlobal()

  if (showLightningIcons) {
    await AsyncStorage.setItem(PV.Keys.V4V_SHOW_LIGHTNING_ICONS, 'TRUE')
  } else {
    await AsyncStorage.removeItem(PV.Keys.V4V_SHOW_LIGHTNING_ICONS)
  }

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        showLightningIcons
      }
    }
  })
}

/* V4VSettings helpers */

const v4vUpdateSettings = async (globalState: any, newSettings: V4VSettings) => {
  await v4vSetSettings(newSettings)

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        settings: newSettings
      }
    }
  })
}

export const v4vGetTypeMethodSettings = (type: 'lightning', method: 'keysend') => {
  const globalState = getGlobal()
  const typeMethodKey = v4vGetTypeMethodKey(type, method)
  const typeMethodSettings = globalState.session.v4v.settings.typeMethod[typeMethodKey]
  return typeMethodSettings
}

const v4vUpdateTypeMethodSettings = async (
  globalState: any,
  type: 'lightning',
  method: 'keysend',
  newTypeMethodSettings: V4VTypeMethod
) => {
  const { settings } = globalState.session.v4v
  const typeMethodKey = v4vGetTypeMethodKey(type, method)
  const newSettings = {
    ...settings,
    typeMethod: {
      ...settings.typeMethod,
      [typeMethodKey]: newTypeMethodSettings
    }
  }

  await v4vUpdateSettings(globalState, newSettings)
}

export const v4vUpdateTypeMethodSettingsBoostAmount = async (
  globalState: any,
  type: 'lightning',
  method: 'keysend',
  newBoostAmount: number
) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(type, method)
  const newSettings = {
    ...typeMethodSettings,
    boostAmount: newBoostAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsStreamingAmount = async (
  globalState: any,
  type: 'lightning',
  method: 'keysend',
  newStreamingAmount: number
) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(type, method)
  const newSettings = {
    ...typeMethodSettings,
    streamingAmount: newStreamingAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsAppBoostAmount = async (
  globalState: any,
  type: 'lightning',
  method: 'keysend',
  newAppBoostAmount: number
) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(type, method)
  const newSettings = {
    ...typeMethodSettings,
    appBoostAmount: newAppBoostAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsAppStreamingAmount = async (
  globalState: any,
  type: 'lightning',
  method: 'keysend',
  newAppStreamingAmount: number
) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(type, method)
  const newSettings = {
    ...typeMethodSettings,
    appStreamingAmount: newAppStreamingAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

/* Connected Provider helpers */

export const v4vInitializeConnectedProviders = async () => {
  const savedProviders = await v4vGetProvidersConnected()
  
  for (const savedProvider of savedProviders) {
    (async () => {
      await v4vRefreshAccessToken(savedProvider?.key)
      const preventPlayerUpdate = true
      v4vRefreshProviderWalletInfo(savedProvider?.key, preventPlayerUpdate)
    })()
  }

  return savedProviders
}

export const v4vGetConnectedProvider = (connectedProviders: V4VProviderConnectedState[], key: string) => {
  const connectedProvider = connectedProviders?.find((item: any) => item.key === key)
  return connectedProvider
}

export const v4vAddOrUpdateConnectedProvider = async (newProviderState: V4VProviderConnectedState, callback?: any) => {
  const globalState = getGlobal()

  const previousConnected = globalState.session.v4v.providers.connected
  const previousConnectedIndex = previousConnected.findIndex((item) => item.key === newProviderState.key)
  const newConnected = previousConnected

  if (previousConnectedIndex >= 0) {
    newConnected[previousConnectedIndex] = newProviderState
  } else {
    newConnected.push(newProviderState)
  }

  await v4vSetProvidersConnected(newConnected)

  setGlobal(
    {
      session: {
        ...globalState.session,
        v4v: {
          ...globalState.session.v4v,
          providers: {
            ...globalState.session.v4v.providers,
            connected: newConnected
          }
        }
      }
    },
    () => {
      // Make sure the global player state is updated
      // so the boostagram buttons show.
      const nowPlayingItem = globalState?.player?.nowPlayingItem
      if (nowPlayingItem) {
        playerUpdatePlayerState(nowPlayingItem)
      }

      callback?.()
    }
  )
}

export const v4vDisconnectProvider = async (key: 'alby') => {
  const globalState = getGlobal()

  await v4vDeleteProviderFromStorage(key)

  const previousConnected = globalState.session.v4v.providers.connected
  const newConnected = previousConnected.filter((provider) => provider.key !== key)

  await v4vSetProvidersConnected(newConnected)

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        providers: {
          ...globalState.session.v4v.providers,
          connected: newConnected
        }
      }
    }
  })
}

/* V4VActiveProvider helpers */

export const v4vGetMatchingActiveProvider = (valueTags: ValueTag[]) => {
  const globalState = getGlobal()
  const { connected } = globalState.session.v4v.providers
  let matchingActiveProvider = null

  if (valueTags && valueTags.length > 0 && connected && connected.length > 0) {
    matchingActiveProvider = connected.find((provider: V4VProviderConnectedState) => {
      return valueTags.some((valueTag) => valueTag.method === provider.method && valueTag.type === provider.type)
    })
  }

  return matchingActiveProvider
}

export const v4vRefreshAccessToken = async (activeProviderKey: string) => {
  // Use require here to prevent circular dependencies issues.
  if (activeProviderKey === 'alby') {
    const { v4vAlbyRefreshAccessToken } = require('../../../services/v4v/providers/alby')
    await v4vAlbyRefreshAccessToken()
  }
}

export const v4vRefreshProviderWalletInfo = async (activeProviderKey: string, preventPlayerUpdate?: boolean) => {
  // Use require here to prevent circular dependencies issues.
  if (activeProviderKey === 'alby') {
    const { v4vAlbyGetAccountInfo } = require('./providers/alby')
    await v4vAlbyGetAccountInfo()
  }
  
  // Make sure the global player state is updated
  // so the boostagram buttons show.
  const globalState = getGlobal()
  const nowPlayingItem = globalState?.player?.nowPlayingItem
  if (!preventPlayerUpdate && nowPlayingItem) {
    playerUpdatePlayerState(nowPlayingItem)
  }
}

export const v4vGetActiveProviderInfo = (valueTags: ValueTag[]) => {
  let activeProvider = null
  let activeProviderSettings = null

  if (Array.isArray(valueTags)) {
    const tempProvider = v4vGetMatchingActiveProvider(valueTags)
    
    if (tempProvider?.type && tempProvider?.method) {
      activeProvider = tempProvider
      activeProviderSettings = v4vGetTypeMethodSettings(tempProvider.type, tempProvider.method)
    }
  }

  return {
    activeProvider,
    activeProviderSettings
  }
}

/* V4V PreviousTransactionErrors helpers */

export const v4vAddPreviousTransactionError = (
  type: 'boost' | 'stream',
  address: string,
  message: string,
  customKey?: string,
  customValue?: string
) => {
  const globalState = getGlobal()

  const newErrors = globalState.session.v4v.previousTransactionErrors[type]

  const newError: V4VTransactionError = {
    address,
    message,
    customKey,
    customValue
  }

  newErrors.push(newError)

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        previousTransactionErrors: {
          ...globalState.session.v4v.previousTransactionErrors,
          [type]: [...newErrors]
        }
      }
    }
  })
}

export const v4vClearPreviousTransactionErrors = () => {
  const globalState = getGlobal()

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        previousTransactionErrors: {
          boost: [],
          streaming: []
        }
      }
    }
  })
}

/* V4VSenderInfo helpers */

export const v4vUpdateSenderInfoName = async (newName: string) => {
  const globalState = getGlobal()

  await v4vSetSenderInfo({ name: newName })

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        senderInfo: {
          ...globalState.session.v4v.senderInfo,
          name: newName
        }
      }
    }
  })
}

/* V4VBoostagramMessage helpers */

export const v4vUpdateBoostagramMessage = (newMessage: string) => {
  const globalState = getGlobal()

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        boostagramMessage: newMessage
      }
    }
  })
}

export const v4vClearBoostagramMessage = () => {
  const globalState = getGlobal()

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        boostagramMessage: ''
      }
    }
  })
}

/* Convert to Boostagram Item */

export const v4vConvertToBoostagramItem = (podcast?: Podcast, episode?: Episode) => {
  const { player } = getGlobal()
  const { nowPlayingItem } = player

  let item = {} as BoostagramItem
  if (episode && podcast) {
    item = {
      episodeFunding: episode.funding || [],
      episodeGuid: episode.guid || '',
      episodePubDate: episode.pubDate,
      episodeTitle: episode.title || '',
      episodeValue: episode.value || [],
      podcastFunding: podcast.funding || [],
      podcastIndexPodcastId: podcast.podcastIndexId || '',
      podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
      podcastTitle: podcast.title || '',
      podcastValue: podcast.value || [],
      podcastGuid: podcast.podcastGuid || ''
    }
  } else if (podcast) {
    item = {
      podcastFunding: podcast.funding || [],
      podcastIndexPodcastId: podcast.podcastIndexId || '',
      podcastShrunkImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
      podcastTitle: podcast.title || '',
      podcastValue: podcast.value || [],
      podcastGuid: podcast.podcastGuid || ''
    }
  } else if (nowPlayingItem) {
    item = {
      episodeFunding: nowPlayingItem.episodeFunding || [],
      episodeGuid: nowPlayingItem.episodeGuid || '',
      episodePubDate: (nowPlayingItem.episodePubDate ) || new Date(),
      episodeTitle: nowPlayingItem.episodeTitle || '',
      episodeValue: nowPlayingItem.episodeValue || [],
      podcastFunding: nowPlayingItem.podcastFunding || [],
      podcastIndexPodcastId: nowPlayingItem.podcastIndexPodcastId || '',
      podcastShrunkImageUrl: nowPlayingItem.podcastShrunkImageUrl || nowPlayingItem.podcastImageUrl || '',
      podcastTitle: nowPlayingItem.podcastTitle || '',
      podcastValue: nowPlayingItem.podcastValue || [],
      podcastGuid: nowPlayingItem.podcastGuid || ''
    }
  }

  return item
}

/* Enrich the value tag in state */

const convertValueTimeSplitsToAppConvertedSplits = (
  oldValueTimeSplit: any,
  valueTimeSplitValueTags: ValueTag[],
  type: 'remoteItemToAppConverted' | 'localSpecifiedToAppConverted'
) => {
  return {
    type,
    startTime: oldValueTimeSplit.startTime,
    duration: oldValueTimeSplit.duration,
    endTime: oldValueTimeSplit.startTime + oldValueTimeSplit.duration,
    remoteStartTime: oldValueTimeSplit.remoteStartTime,
    remotePercentage: oldValueTimeSplit.remotePercentage,
    remoteItem: oldValueTimeSplit.remoteItem,
    valueTags: valueTimeSplitValueTags,
    remoteFeedGuid: oldValueTimeSplit.remoteFeedGuid,
    remoteItemGuid: oldValueTimeSplit.remoteItemGuid
  }
}

export const v4vEnrichValueTagDataIfNeeded = async (item: NowPlayingItem) => {
  if (!item) return
  const oldValueTags = item.episodeValue || []
  const newValueTags: ValueTag[] = []
  
  for (const oldValueTag of oldValueTags) {
    const oldValueTimeSplits = oldValueTag.valueTimeSplits || []
    if (oldValueTag) {
      const newValueTag = {...oldValueTag}
      const parentValueTag = {
        ...oldValueTag,
        valueTimeSplits: null
      }
      if (!item.liveItem && checkIfIsLightningKeysendValueTag(oldValueTag)) {
        const newValueTimeSplits: ValueTimeSplit[] = []
        for (const oldValueTimeSplit of oldValueTimeSplits) {
          let newValueTimeSplit: ValueTimeSplit | null = null
          if (oldValueTimeSplit?.type && oldValueTimeSplit.remoteItem?.feedGuid) {
            if (
              oldValueTimeSplit?.type === 'remoteItemToAppConverted'
              || oldValueTimeSplit?.type === 'localSpecifiedToAppConverted'
            ) {
              // Do nothing. It's already converted.
            } else if (oldValueTimeSplit?.type === 'remoteItem') {
              const valueTimeSplitTags = await getValueTagsForItemGuidOrFeedGuid(
                oldValueTimeSplit.remoteItem?.feedGuid,
                oldValueTimeSplit.remoteItem?.itemGuid
              )
              newValueTimeSplit = convertValueTimeSplitsToAppConvertedSplits(
                oldValueTimeSplit,
                valueTimeSplitTags,
                'remoteItemToAppConverted'
              )

              newValueTimeSplit.parentValueTag = parentValueTag
              newValueTimeSplits.push(newValueTimeSplit)
            } else if (oldValueTimeSplit?.type === 'localSpecified') {
              // TODO - handle locally specified value time splits
              newValueTimeSplits.push(oldValueTimeSplit)
            } else {
              newValueTimeSplits.push(oldValueTimeSplit)
            }
          } else {
            newValueTimeSplits.push(oldValueTimeSplit)
          }
        }
        newValueTag.valueTimeSplits = newValueTimeSplits
      }
      newValueTags.push(newValueTag)
    }

    const playerState = getGlobal().player
    const nowPlayingItem = playerState?.nowPlayingItem

    if (nowPlayingItem) {
      setGlobal({
        player: {
          ...playerState,
          nowPlayingItem: {
            ...nowPlayingItem,
            episodeValue: newValueTags
          }
        }
      })
    }
  }
}

export const handleIntervalEnrichGlobalState = async (session: any) => {
  const boostagramItem = v4vConvertToBoostagramItem()
  const playerPositionState = await playerGetPosition()
  const { activeProvider } =
    v4vGetActiveProviderInfo(getBoostagramItemValueTags(boostagramItem))
  const { episodeValue, podcastValue } = boostagramItem
  const valueTags = extractV4VValueTags(episodeValue, podcastValue)
  const activeValueTag = v4vGetActiveValueTag(
    valueTags, playerPositionState, activeProvider?.type, activeProvider?.method)
  if (activeValueTag && activeProvider) {
    setGlobal({
      session: {
        ...session,
        v4v: {
          ...session.v4v,
          valueTimeSplitIsActive: !!activeValueTag?.activeValueTimeSplit?.isActive
        }
      }
    })
  }
}

/* Misc helpers */

export const getBoostagramItemValueTags = (item?: NowPlayingItem | BoostagramItem) => {
  let valueTags = []
  if (item) {
    valueTags = (item.episodeValue?.length && item.episodeValue)
      || (item.podcastValue?.length && item.podcastValue)
      || []
  }
  return valueTags
}
