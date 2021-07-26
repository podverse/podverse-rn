import { setGlobal } from "reactn"
import { checkIfTrackingIsEnabled as checkIfTrackingIsEnabledService, 
  setTrackingEnabled as setTrackingEnabledService } from '../../services/tracking'

export const setTrackingEnabled = async (isEnabled?: boolean) => {
  const finalIsEnabled = await setTrackingEnabledService(isEnabled)
  setGlobal({ listenTrackingEnabled: finalIsEnabled })  
}

export const checkIfTrackingIsEnabled = async () => {
  const finalIsEnabled = await checkIfTrackingIsEnabledService()
  setGlobal({ listenTrackingEnabled: finalIsEnabled })  
}
