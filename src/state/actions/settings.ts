import AsyncStorage from '@react-native-community/async-storage'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'

export const initializeSettings = async () => {
  const hideNSFWEpisodesAndClips = await AsyncStorage.getItem(PV.Keys.HIDE_NSFW_EPISODES_AND_CLIPS)

  setGlobal({
    hideNSFWEpisodesAndClips
  })
}

export const setHideNSFWEpisodesAndClips = async (value: boolean) => {
  setGlobal({ hideNSFWEpisodesAndClips: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.HIDE_NSFW_EPISODES_AND_CLIPS, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.HIDE_NSFW_EPISODES_AND_CLIPS)
  })
}
