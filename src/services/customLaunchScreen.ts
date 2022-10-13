import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const getCustomLaunchScreenKey = async () => {
  let customLaunchScreen = PV.RouteNames.PodcastsScreen

  try {
    const savedLaunchScreen = await AsyncStorage.getItem(PV.Keys.CUSTOM_LAUNCH_SCREEN)
    if (savedLaunchScreen && PV.CustomLaunchScreen.validScreenKeys.includes(savedLaunchScreen)) {
      customLaunchScreen = savedLaunchScreen
    }
  } catch (error) {
    console.log('getCustomLaunchScreenKey error', error)
  }
  return customLaunchScreen
}

export const setCustomLaunchScreenKey = async (customLaunchScreen: string) => {
  try {
    if (customLaunchScreen && PV.CustomLaunchScreen.validScreenKeys.includes(customLaunchScreen)) {
      await AsyncStorage.setItem(PV.Keys.CUSTOM_LAUNCH_SCREEN, customLaunchScreen)
    } else {
      await AsyncStorage.removeItem(PV.Keys.CUSTOM_LAUNCH_SCREEN)
    }
  } catch (error) {
    console.log('setCustomLaunchScreenKey error', error)
  }
}
