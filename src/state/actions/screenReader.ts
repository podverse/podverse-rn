import { AccessibilityInfo } from 'react-native'
import { setGlobal } from 'reactn'

export const updateScreenReaderEnabledState = () => {
  const screenReaderEnabled = AccessibilityInfo.isScreenReaderEnabled()
  setGlobal({ screenReaderEnabled })
}
