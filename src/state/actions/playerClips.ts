import { setGlobal } from 'reactn'

export const startClipInterval = () => {
  setGlobal({ clipIntervalActive: true })
}

export const stopClipInterval = () => {
  setGlobal({ clipIntervalActive: false })
}
