import { hasValidDownloadingConnection, hasValidNetworkConnection } from '../lib/network'
import { getBearerToken } from './auth'
import { request } from './request'

export const updateGooglePlayPurchaseStatus = async (data: any) => {
  await hasValidNetworkConnection()
  await hasValidDownloadingConnection()
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/google-play/update-purchase-status',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: data,
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  return response && response.data
}
