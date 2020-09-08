import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { PV } from '../../resources'
import { getAuthUserInfo } from './auth'

export const purchaseLoading = () => {
  const globalState = getGlobal()

  return {
    purchase: {
      ...globalState.purchase,
      isLoading: true,
      message: translate('Please wait while your transaction completes'),
      showContactSupportLink: false,
      showDismissLink: false,
      showRetryLink: false,
      title: translate('Processing')
    }
  } as any
}

export const handleStatusSuccessful = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_SUCCESS.message,
      showContactSupportLink: false,
      showDismissLink: true,
      showRetryLink: false,
      title: PV.Alerts.PURCHASE_SUCCESS.title
    }
  })

  await getAuthUserInfo()
}

export const handleStatusPending = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_PENDING.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: true,
      title: PV.Alerts.PURCHASE_PENDING.title
    }
  })
}

export const handleStatusCancel = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_CANCELLED.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: false,
      title: PV.Alerts.PURCHASE_CANCELLED.title
    }
  })
}

export const showPurchaseSomethingWentWrongError = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: true,
      title: PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.title
    }
  })
}
