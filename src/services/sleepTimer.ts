import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const getSleepTimerDefaultTimeRemaining = async () => {
  const defaultTimeRemaining = await AsyncStorage.getItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING)
  return defaultTimeRemaining ? parseInt(defaultTimeRemaining, 10) : PV.Player.defaultSleepTimerInSeconds
}

export const initSleepTimerDefaultTimeRemaining = async () => {
  const defaultTimeRemaining = await getSleepTimerDefaultTimeRemaining()
  return defaultTimeRemaining || PV.Player.defaultSleepTimerInSeconds
}

export const setSleepTimerDefaultTimeRemaining = async (seconds: number) => {
  if (seconds >= 0) {
    return AsyncStorage.setItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING, seconds.toString())
  }
}
