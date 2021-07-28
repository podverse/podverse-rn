import AsyncStorage from "@react-native-community/async-storage"

const testKey = 'asyncStorageTestKey'

export const checkIfAsyncStorageIsEnabled = async () => {
  let result = false
  await AsyncStorage.setItem(testKey, 'TRUE')
  const value = await AsyncStorage.getItem(testKey)
  result = value === 'TRUE'
  await AsyncStorage.removeItem(testKey)
  return result
}
