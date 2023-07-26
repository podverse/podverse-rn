import { Dimensions, Platform } from 'react-native'
import Config from 'react-native-config'
import { isTablet } from 'react-native-device-info'

export const pvIsTablet = () => {
  return isTablet()

  // f-droid only
  // return isTabletBasedOnRatio()
}

/*
  This helper is only needed for F-Droid,
  where react-native-device-info is unavailable.
*/
// const isTabletBasedOnRatio = () => {
//   const screenHeight = Dimensions.get('window').height
//   const screenWidth = Dimensions.get('window').width
//   const ratio = screenHeight / screenWidth
//   if (ratio >= 1.6) {
//     return false
//   } else {
//     return true
//   }
// }

export const isPortrait = () => {
  const dim = Dimensions.get('window')
  return dim.height >= dim.width
}

export const checkIfFDroidAppVersion = () => {
  return Platform.OS === 'android' && Config.RELEASE_TYPE === 'F-Droid'
}
