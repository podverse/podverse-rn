import { getBearerToken } from './auth'
import { request } from './request'

export const updateAppStorePurchaseStatus = async (transactionReceipt: any) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/app-store/update-purchase-status-2',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      transactionReceipt
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  return response
}
