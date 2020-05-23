import AsyncStorage from '@react-native-community/async-storage'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'

export const initializeSettings = async () => {
  const censorNSFWEpisodesAndClips = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_EPISODES_AND_CLIPS)

  setGlobal({
    censorNSFWEpisodesAndClips
  })
}

export const setCensorNSFWEpisodesAndClips = async (value: boolean) => {
  setGlobal({ censorNSFWEpisodesAndClips: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CENSOR_NSFW_EPISODES_AND_CLIPS, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CENSOR_NSFW_EPISODES_AND_CLIPS)
  })
}
