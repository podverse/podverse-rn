import AsyncStorage from '@react-native-community/async-storage'
import { NativeModules, Platform, Alert } from 'react-native'

const testKey = 'asyncStorageTestKey'

export const checkIfAsyncStorageIsEnabled = async () => {
  let result = false
  await AsyncStorage.setItem(testKey, 'TRUE')
  const value = await AsyncStorage.getItem(testKey)
  result = value === 'TRUE'
  await AsyncStorage.removeItem(testKey)
  return result
}

export const checkInvalidAsyncStorageCapacity = async () => {
  if(Platform.OS === "ios") {
    console.log("Not implemented for ios")
    return false
  } else {
      const {PVAsyncStorage} = NativeModules;
      const returnObj = await PVAsyncStorage?.getUsedStorageSize?.()
      if(!returnObj || returnObj.size === null || returnObj.size === undefined) {
        throw new Error('Used size could not be read')
      }

      // 29MB is the limit for AsyncStorage on Android
      if(returnObj.size < (29 * 1024 * 1024)) {
        return false
      }

      Alert.alert('Warning', `You have exceed your alloted subscription size. 
      Please unsubscribe from a few podcasts to continue`, [{text:"OK"}])

      return true
  }
}

// if(checkInvalidAsyncStorageCapacity()) return