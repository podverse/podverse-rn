import { setGlobal } from 'reactn'
import { TempMediaRef } from '../../resources/Interfaces'

export const clearTempMediaRef = async () => {
  return setGlobal({
    tempMediaRefInfo: {
      startTime: undefined,
      endTime: null,
      clipTitle: undefined
    }
  })
}

export const saveTempMediaRef = async ({startTime, endTime, clipTitle}: TempMediaRef ) => {
  return setGlobal({
    tempMediaRefInfo: {
      startTime,
      endTime,
      clipTitle
    }
  })
}
