import AsyncStorage from '@react-native-community/async-storage'
import { NativeModules, Platform, Alert } from 'react-native'
import { translate } from './i18n'
import { debugLogger } from './logger'

const testKey = 'asyncStorageTestKey'

export const checkIfAsyncStorageIsEnabled = async () => {
  let result = false
  await AsyncStorage.setItem(testKey, 'TRUE')
  const value = await AsyncStorage.getItem(testKey)
  result = value === 'TRUE'
  await AsyncStorage.removeItem(testKey)
  return result
}

// duplicated in android/gradle.properties
const AsyncStorage_db_size_in_MB = 33

// Prevent alert from being thrown multiple times in rapid succession
let shouldPreventAlert = false

export const checkInvalidAsyncStorageCapacity = async () => {
  if (Platform.OS === 'ios') {
    debugLogger('Not implemented for ios')
    return false
  } else {
    const { PVAsyncStorage } = NativeModules
    const returnObj = await PVAsyncStorage?.getUsedStorageSize?.()
    // Size in bytes
    if (!returnObj || returnObj.size === null || returnObj.size === undefined) {
      throw new Error('Used size could not be read')
    }

    // 30MB is the limit for AsyncStorage on Android
    // Return true until size is less than within 3MB of max capacity.
    if (returnObj.size < (AsyncStorage_db_size_in_MB - 3) * 1024 * 1024) {
      return false
    }

    if (!shouldPreventAlert) {
      shouldPreventAlert = true
      Alert.alert(translate('Error'), translate('Storage data exceeded message'), [{ text: translate('Ok') }])
      setTimeout(() => {
        shouldPreventAlert = false
      }, 10000)
    }

    return true
  }
}

export const setItemWithStorageCapacityCheck = async (key: string, value: string) => {
  await checkInvalidAsyncStorageCapacity()
  await AsyncStorage.setItem(key, value)
}
