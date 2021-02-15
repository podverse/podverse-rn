import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { PVTrackPlayer } from './player'

let sleepTimerInterval = null as any
let timeRemaining = 0
export const sleepTimerIsRunning = () => !!sleepTimerInterval

export const getSleepTimerDefaultTimeRemaining = async () => {
  const defaultTimeRemaining = await AsyncStorage.getItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING)
  return defaultTimeRemaining ? parseInt(defaultTimeRemaining, 10) : PV.Player.defaultSleepTimerInSeconds
}

export const getSleepTimerTimeRemaining = () => {
  return timeRemaining
}

export const handleSleepTimerReachedEnd = async () => {
  stopSleepTimer()
  PVTrackPlayer.pause()
  const defaultTimeRemaining = await getSleepTimerDefaultTimeRemaining()
  timeRemaining = defaultTimeRemaining
}

export const initSleepTimerDefaultTimeRemaining = async () => {
  const defaultTimeRemaining = await getSleepTimerDefaultTimeRemaining()
  timeRemaining = defaultTimeRemaining || PV.Player.defaultSleepTimerInSeconds
  return timeRemaining
}

export const setSleepTimerDefaultTimeRemaining = async (seconds: number) => {
  if (seconds >= 0) {
    return AsyncStorage.setItem(PV.Keys.SLEEP_TIMER_DEFAULT_TIME_REMAINING, seconds.toString())
  }
}

export const setSleepTimerTimeRemaining = (hours: number, minutes: number, seconds: number) => {
  let totalSeconds = hours * 3600
  totalSeconds += minutes * 60
  totalSeconds += seconds
  timeRemaining = totalSeconds
  return timeRemaining
}

export const startSleepTimer = async () => {
  stopSleepTimer()

  const seconds = getSleepTimerTimeRemaining()
  await setSleepTimerDefaultTimeRemaining(seconds)

  timeRemaining = seconds

  sleepTimerInterval = setInterval(() => {
    (async () => {
      const seconds = getSleepTimerTimeRemaining()
      timeRemaining = seconds - 1
      
      if (timeRemaining <= 0) {
        await handleSleepTimerReachedEnd()
      }
    })()
  }, 1000)
}

export const stopSleepTimer = () => {
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval)
    sleepTimerInterval = null
  }
}
