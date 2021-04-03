import axios from 'axios'
import { Alert } from 'react-native'
import { getLNWallet, LNWallet, Value } from '../state/actions/lnpay'
import { PV } from '../resources'

type Request = {
  endpoint?: string
  query?: any
  body?: any
  headers?: any
  method?: string
  opts?: any
}

type Recepient = {
  address: string
  amount: number
  customData: Record<string, unknown>
}

const request = async (req: Request) => {
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

export const sendPayments = async (destinationData: Value) => {
  let error = null
  try {
    if (destinationData.model.type === 'lightning' && destinationData.model.method === 'keysend') {
      const userWallet = await getLNWallet()
      if (userWallet) {
        for (const destination of destinationData.destinations) {
          const customData = destination.customKey ? { [destination.customKey]: destination.customValue } : {}
          const recepient: Recepient = {
            address: destination.address,
            amount: destination.split,
            customData
          }
          try {
            await sendPayment(userWallet, recepient)
          } catch (paymentError) {
            error = paymentError
          }
        }
      }
    }
  } catch (err) {
    console.log('Error Sending LNPayment: ', error)
  }

  if (error) {
    Alert.alert('LNPay Error', 'Something went wrong with one or more payments.')
  } else {
    Alert.alert('Boost sent!')
  }
}

const sendPayment = (wallet: LNWallet, recepient: Recepient) => {
  return request({
    method: 'POST',
    endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'][0] + '/keysend',
    headers: {
      'X-Api-Key': wallet.publicKey
    },
    body: {
      dest_pubkey: recepient.address,
      num_satoshis: recepient.amount,
      passThru: recepient.customData
    }
  })
}
