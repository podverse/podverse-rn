import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

let sleepTimerInterval = null as any
let timeRemaining = 0

export const getSleepTimerDefaultTimeRemaining = async () => {
  const defaultTimeRemaining = await AsyncStorage.getItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING)
  return defaultTimeRemaining ? defaultTimeRemaining : 1800000
}

export const getSleepTimerTimeRemaining = () => {
  return timeRemaining
}

export const handleSleepTimerReachedEnd = () => {
  clearInterval(sleepTimerInterval)
}

export const setSleepTimerDefaultTimeRemaining = async (seconds: number) => {
  if (seconds && seconds > 60) {
    return AsyncStorage.setItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING, seconds.toString())
  }
}

export const startSleepTimer = async (seconds: number) => {
  if (sleepTimerInterval) {
    stopSleepTimer()
  }

  await setSleepTimerDefaultTimeRemaining(seconds)

  timeRemaining = seconds

  sleepTimerInterval = setInterval(() => {
    timeRemaining = seconds - 1
  }, 1000)
}

export const stopSleepTimer = () => {
  clearInterval(sleepTimerInterval)
}
