import Config from 'react-native-config'
import { errorLogger } from './logger'

export const trackCrashEvent = (info: { [key: string]: string }) => {
  if (!Config.DISABLE_CRASH_LOGS) {
    import('appcenter-analytics')
      .then((Analytics) => {
        Analytics.trackEvent('Javascript Crash', info)
      })
      .catch((error) => {
        errorLogger('App Center Analytics library not loaded: ', error)
      })
  }
}
