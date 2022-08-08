import { PV } from '../../../../resources'
import PVEventEmitter from '../../../../services/eventEmitter'
import {
  v4vAlbyGetAccountSummary as v4vAlbyGetAccountSummaryService,
  v4vAlbyGetAccountValue4ValueInfo as v4vAlbyGetAccountValue4ValueService,
  v4vAlbyRequestAccessToken as v4vAlbyRequestAccessTokenService
} from '../../../../services/v4v/providers/alby'
import { v4vAddOrUpdateConnectedProvider, V4VProviderConnectedState } from '../v4v'

export const v4vAlbyHandleConnect = async (navigation: any, code: string) => {
  navigation.navigate(PV.RouteNames.MoreScreen)
  navigation.navigate(PV.RouteNames.V4VProvidersScreen)
  navigation.navigate(PV.RouteNames.V4VProvidersAlbyScreen, {
    isLoadingWaitForEvent: true
  })

  await v4vAlbyRequestAccessTokenService(code)

  // save providerInfo to connectedProviders async storage and global state
  // write helper for getting and updating connectedProviders in async storage
  // write helper for getting and updating connectedProviders in global state
  // update global state with activeProvider, enabledProviders, and connectedProviders
  // fire event "v4v-alby-connected"

  PVEventEmitter.emit(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED)
}

export const v4vAlbyGetAccountInfo = async (callback?: any) => {
  const summaryData = await v4vAlbyGetAccountSummaryService()
  const v4vData = await v4vAlbyGetAccountValue4ValueService()

  const albyProviderState: V4VProviderConnectedState = {
    key: PV.V4V.providers.alby.key,
    address: v4vData.lightning_address,
    balance: summaryData.balance,
    boostagrams_count: summaryData.boostagrams_count,
    currency: summaryData.currency,
    keysend_custom_key: v4vData.keysend_custom_key,
    keysend_custom_value: v4vData.keysend_custom_value,
    method: 'keysend',
    transactions_count: summaryData.transactions_count,
    type: 'lightning',
    unit: summaryData.unit
  }

  v4vAddOrUpdateConnectedProvider(albyProviderState, callback)
}
