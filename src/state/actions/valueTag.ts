import { getGlobal, setGlobal } from 'reactn'
import { setStreamingValueOn } from '../../services/v4v/v4v'

/*
  initializeValueProcessor must be called after getAuthUserInfo
  so the valueTagSettings data is available on global state.
*/

export const toggleValueStreaming = async () => {
  const globalState = getGlobal()
  const { session } = globalState
  const { v4v } = session
  const { streamingValueOn } = v4v
  const newVal = !streamingValueOn

  await setStreamingValueOn(newVal)

  setGlobal(
    {
      session: {
        ...session,
        v4v: {
          ...v4v,
          streamingValueOn: newVal
        }
      }
    }
  )
}

export const setValueStreaming = async (bool: boolean) => {
  const globalState = getGlobal()
  const { session } = globalState
  const { v4v } = session

  await setStreamingValueOn(bool)

  setGlobal({
    session: {
      ...session,
      v4v: {
        ...v4v,
        streamingValueOn: bool
      }
    }
  })
}
