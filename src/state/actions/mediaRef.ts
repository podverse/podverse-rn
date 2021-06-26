import { setGlobal } from 'reactn'
import { TempMediaRef } from 'src/resources/Interfaces'

export const clearTempMediaRef = () => {
  setGlobal({
    tempMediaRefInfo: {
      startTime: undefined,
      endTime: null,
      clipTitle: undefined
    }
  })
}

export const saveTempMediaRef = ({startTime, endTime, clipTitle}: TempMediaRef ) => {
    setGlobal({
      tempMediaRefInfo: {
        startTime,
        endTime,
        clipTitle
      }
    })
  }
