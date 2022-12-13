import { getGlobal, setGlobal } from 'reactn'
import { setClipHasEnded } from '../../services/player'

export const startClipInterval = () => {
  setGlobal({ clipIntervalActive: true })
}

export const stopClipInterval = () => {
  setGlobal({ clipIntervalActive: false })
}

export const startCheckClipEndTime = async () => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem
    if (clipId && clipEndTime) {
      await setClipHasEnded(false)
      startClipInterval()
    }
  }
}
