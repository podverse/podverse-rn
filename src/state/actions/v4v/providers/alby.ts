import { PV } from '../../../../resources'
import PVEventEmitter from '../../../../services/eventEmitter'
import {
  v4vAlbyGetAccountSummary as v4vAlbyGetAccountSummaryService,
  v4vAlbyRequestAccessToken as v4vAlbyRequestAccessTokenService
} from '../../../../services/v4v/providers/alby'

export const v4vAlbyHandleConnect = async (navigation: any, code: string) => {
  navigation.navigate(PV.RouteNames.MoreScreen)
  navigation.navigate(PV.RouteNames.V4VProvidersScreen)
  navigation.navigate(PV.RouteNames.V4VProvidersAlbyScreen, {
    isLoadingWaitForEvent: true
  })
  const codeData = await v4vAlbyRequestAccessTokenService(code)

  console.log('codeData', codeData)

  const accountSummary = await v4vAlbyGetAccountSummary()
  console.log('accountSummary', accountSummary)


  // save providerInfo to connectedProviders async storage and global state
  // write helper for getting and updating connectedProviders in async storage
  // write helper for getting and updating connectedProviders in global state
  // update global state with activeProvider, enabledProviders, and connectedProviders
  // fire event "v4v-alby-connected"

  PVEventEmitter.emit(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED)
}

export const v4vAlbyGetAccountSummary = async () => {
  const data = await v4vAlbyGetAccountSummaryService()
  
  // update global state
  
  return data
}