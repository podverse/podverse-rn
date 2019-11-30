import {
  hasValidDownloadingConnection,
  hasValidNetworkConnection
} from '../lib/network'
import { getBearerToken } from './auth'
import { request } from './request'

export const updateAppStorePurchaseStatus = async (base64EncodedTransactionReceipt: any) => {
  await hasValidNetworkConnection()
  await hasValidDownloadingConnection()
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/app-store/update-purchase-status',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      transactionReceipt: base64EncodedTransactionReceipt
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  return response && response.data
}
