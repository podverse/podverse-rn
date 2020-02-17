import { getGlobal, setGlobal } from 'reactn'
import { getSleepTimerTimeRemaining as getSleepTimerTimeRemainingService,
  handleSleepTimerReachedEnd as handleSleepTimerReachedEndService,
  setSleepTimerTimeRemaining as setSleepTimerTimeRemainingService,
  sleepTimerIsRunning,
  startSleepTimer as startSleepTimerService,
  stopSleepTimer as stopSleepTimerService
} from '../../services/sleepTimer'

let sleepTimerInterval = null as any

export const handleSleepTimerReachedEnd = () => {
  handleSleepTimerReachedEndService()
}

export const pauseSleepTimerStateUpdates = () => {
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval)
    sleepTimerInterval = null
  }
}

export const resumeSleepTimerStateUpdates = () => {
  pauseSleepTimerStateUpdates()

  sleepTimerInterval = setInterval(() => {
    updateSleepTimerTimeRemaining()
    const timeRemaining = getSleepTimerTimeRemainingService()
    if (timeRemaining <= 1) {
      pauseSleepTimerStateUpdates()

      // Wait for the SleepTimer service to reset the timeRemaining to the defaultTimeRemaining
      // before updating state.
      setTimeout(() => {
        const globalState = getGlobal()
        const defaultTimeRemaining = getSleepTimerTimeRemainingService()
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
      }, 1000)
    }

  }, 1000)
}

export const setSleepTimerTimeRemaining = (hours: number, minutes: number, seconds: number) => {
  const globalState = getGlobal()
  const timeRemaining = setSleepTimerTimeRemainingService(hours, minutes, seconds)

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

export const startSleepTimer = (seconds: number) => {
  const globalState = getGlobal()
  startSleepTimerService(seconds)
  resumeSleepTimerStateUpdates()

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
  stopSleepTimerService()
  pauseSleepTimerStateUpdates()

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

export const updateSleepTimerTimeRemaining = () => {
  const globalState = getGlobal()
  const timeRemaining = getSleepTimerTimeRemainingService()

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        ...globalState.player.sleepTimer,
        timeRemaining,
        isActive: sleepTimerIsRunning()
      }
    }
  })
}
