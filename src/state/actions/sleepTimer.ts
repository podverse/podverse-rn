import { getGlobal, setGlobal } from 'reactn'
import { getSleepTimerTimeRemaining as getSleepTimerTimeRemainingService,
  handleSleepTimerReachedEnd as handleSleepTimerReachedEndService,
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
  }
}

export const resumeSleepTimerStateUpdates = () => {
  sleepTimerInterval = setInterval(() => {
    updateSleepTimerTimeRemaining()
  }, 1000)
}

export const startSleepTimer = (seconds: number) => {
  startSleepTimerService(seconds)
  resumeSleepTimerStateUpdates()
}

export const stopSleepTimer = () => {
  stopSleepTimerService()
  pauseSleepTimerStateUpdates()
}

export const updateSleepTimerTimeRemaining = () => {
  const globalState = getGlobal()
  const timeRemaining = getSleepTimerTimeRemainingService()

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
