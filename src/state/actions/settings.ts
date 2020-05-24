import AsyncStorage from '@react-native-community/async-storage'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'

export const initializeSettings = async () => {
  const censorNSFWText = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_TEXT)

  setGlobal({
    censorNSFWText
  })
}

export const setcensorNSFWText = async (value: boolean) => {
  setGlobal({ censorNSFWText: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CENSOR_NSFW_TEXT, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CENSOR_NSFW_TEXT)
  })
}
