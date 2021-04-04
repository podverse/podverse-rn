import axios from 'axios'
import { Alert } from 'react-native'
import { calculateSplit, Value } from '../lib/valueTagHelpers'
import { getLNWallet, LNWallet } from '../state/actions/lnpay'
import { PV } from '../resources'

type LNPayRequest = {
  endpoint?: string
  query?: any
  body?: any
  headers?: any
  method?: string
  opts?: any
}

type LNPayRecipient = {
  address: string
  amount: number
  customData: Record<string, unknown>
}

const request = async (req: LNPayRequest) => {
  const { endpoint = '', query = {}, headers = {}, body, method = 'GET', opts = {} } = req

  const queryString = Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`
    })
    .join('&')

  const url = `${PV.URLs.lnpay.baseUrl}${endpoint}` + (queryString ? `?${queryString}` : '')

  const axiosRequest = {
    url,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    data: body ? JSON.stringify(body) : '',
    method,
    ...opts,
    timeout: 30000
  }

  try {
    const response = await axios(axiosRequest)

    return response.data
  } catch (error) {
    console.log('LN Pay Request error', error.response.data)
    throw error
  }
}

export const createWallet = (apiKey = '', label?: string) => {
  return request({
    endpoint: '/wallet',
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey
    },
    body: {
      user_label: label || 'Podverse Wallet'
    }
  })
}

export const getAllWallets = (apiKey = '') => {
  return request({
    endpoint: '/wallets',
    headers: {
      'X-Api-Key': apiKey
    }
  })
}

export const sendPayments = async (valueData: Value) => {
  let error = null
  let boostWasSent = false

  try {
    if (
      valueData?.type === 'lightning' && valueData?.method === 'keysend' && Array.isArray(valueData?.valueRecipients)
    ) {
      const userWallet = await getLNWallet()
      
      if (userWallet) {
        const normalizedValueRecipients = calculateSplit(valueData.valueRecipients, 10)
        for (const normalizedValueRecipient of normalizedValueRecipients) {
          const customData = normalizedValueRecipient.customKey
            ? { [normalizedValueRecipient.customKey]: normalizedValueRecipient.customValue }
            : {}
          const recipient: LNPayRecipient = {
            address: normalizedValueRecipient.address,
            amount: normalizedValueRecipient.normalizedSplit || 0,
            customData
          }

          try {
            await sendPayment(userWallet, recipient)
            boostWasSent = true
          } catch (paymentError) {
            error = paymentError
          }
        }
      }
    }
  } catch (err) {
    console.log('Error Sending LNPayment: ', err)
  }

  if (error?.response?.data?.message) {
    Alert.alert('LNPay Error', `${error?.response?.data?.message}`)
  } else if (!boostWasSent) {
    Alert.alert('LNPay Error', 'Something went wrong with one or more payments.')
  } else if (boostWasSent) {
    Alert.alert('Boost sent!')
  }
}

const sendPayment = (wallet: LNWallet, recipient: LNPayRecipient) => {
  return request({
    method: 'POST',
    endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'][0] + '/keysend',
    headers: {
      'X-Api-Key': wallet.publicKey
    },
    body: {
      dest_pubkey: recipient.address,
      num_satoshis: recipient.amount,
      passThru: recipient.customData
    }
  })
}
