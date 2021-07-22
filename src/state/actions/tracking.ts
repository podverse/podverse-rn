import { setGlobal } from "reactn"
import { setTrackingEnabled as setTrackingEnabledService } from '../../services/tracking'

export const setTrackingEnabled = async (isEnabled: boolean) => {
  await setTrackingEnabledService(isEnabled)
  setGlobal({ listenTrackingEnabled: isEnabled })  
}
