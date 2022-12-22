import { convertHoursMinutesSecondsToSeconds } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import { playerHandlePauseWithUpdate } from '../../services/player'
import {
  getSleepTimerDefaultTimeRemaining, 
  setSleepTimerDefaultTimeRemaining
} from '../../services/sleepTimer'

export const handleSleepTimerCountEvent = () => {
  const { timeRemaining } = getGlobal().player.sleepTimer
  const newTimeRemaining = timeRemaining > 0 ? timeRemaining - 1 : 0
  updateSleepTimerTimeRemaining(newTimeRemaining)
  
  if (timeRemaining <= 0) {
    handleSleepTimerEndReached()
  }
}

const handleSleepTimerEndReached = () => {
  playerHandlePauseWithUpdate()

  // Wait for the SleepTimer service to reset the timeRemaining
  // to the defaultTimeRemaining before updating state.
  setTimeout(() => {
    (async () => {
      const globalState = getGlobal()
      const defaultTimeRemaining = await getSleepTimerDefaultTimeRemaining()
      setGlobal({
        player: {
          ...globalState.player,
          sleepTimer: {
            ...globalState.player.sleepTimer,
            isActive: false,
            timeRemaining: defaultTimeRemaining
          }
        }
      })
    })()
  }, 1000)
}

export const setSleepTimerTimeRemaining = (hours: number, minutes: number, seconds: number) => {
  const globalState = getGlobal()
  const timeRemaining = convertHoursMinutesSecondsToSeconds(hours, minutes, seconds)

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        ...globalState.player.sleepTimer,
        timeRemaining
      }
    }
  })
}

export const startSleepTimer = () => {
  const globalState = getGlobal()
  const { timeRemaining } = getGlobal().player.sleepTimer
  setSleepTimerDefaultTimeRemaining(timeRemaining || PV.Player.defaultSleepTimerInSeconds)

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        ...globalState.player.sleepTimer,
        isActive: true
      }
    }
  })
}

export const stopSleepTimer = () => {
  const globalState = getGlobal()

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        ...globalState.player.sleepTimer,
        isActive: false
      }
    }
  })
}

export const updateSleepTimerTimeRemaining = (seconds: number) => {
  const globalState = getGlobal()

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        ...globalState.player.sleepTimer,
        timeRemaining: seconds
      }
    }
  })
}
