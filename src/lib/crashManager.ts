import Config from 'react-native-config'
import { errorLogger } from './logger'

const _fileName = 'src\lib\crashManager.ts'

export const trackCrashEvent = (info: { [key: string]: string }) => {
  if (!Config.DISABLE_CRASH_LOGS) {
    import('appcenter-analytics')
      .then((Analytics) => {
        Analytics.trackEvent('Javascript Crash', info)
      })
      .catch((error) => {
        errorLogger(_fileName, 'App Center Analytics library not loaded: ', error)
      })
  }
}
