import Config from "react-native-config"

export const trackCrashEvent = (info: { [key: string]: string }) => {
    if(!Config.DISABLE_CRASH_LOGS) {
        import('appcenter-analytics').then((Analytics) => {
            Analytics.trackEvent('Javascript Crash', info)
        }).catch((error) => {
            console.log("App Center Analytics library not loaded: ", error)
        })
    }
}