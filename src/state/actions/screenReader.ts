import { AccessibilityInfo } from 'react-native'
import { setGlobal } from 'reactn'

export const updateScreenReaderEnabledState = async () => {
  const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled()
  setGlobal({ screenReaderEnabled })
}
