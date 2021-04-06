import axios from 'axios'
import { Alert } from 'react-native'
import { getGlobal } from 'reactn'
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

export const createWallet = async (apiKey = '', label?: string): Promise<LNWallet | undefined> => {
  try {
    const createdWallet = await request({
      endpoint: '/wallet',
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey
      },
      body: {
        user_label: label || 'Podverse Wallet'
      }
    })

    return {
      id: createdWallet.id,
      publicKey: apiKey,
      access_keys: createdWallet.access_keys
    }
  } catch (error) {
    console.log('Wallet creation Error', error)
    throw new Error('Wallet Creation Failed. ' + error.message)
  }
}

export const getWallet = async (walletInfo: LNWallet): Promise<LNWallet | null> => {
  let existingWallet: LNWallet | null = null
  try {
    const resp = await request({
      endpoint: '/wallet/' + walletInfo.access_keys['Wallet Admin'],
      headers: {
        'X-Api-Key': walletInfo.publicKey
      }
    })
    if (resp.id === walletInfo.id) {
      existingWallet = walletInfo
    }
  } catch (error) {
    if (error.status === 404) {
      existingWallet = null
    } else {
      throw new Error('Wallet Fetch Failed. ' + error.message)
    }
  }

  return existingWallet
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
  let boostsSent = true

  try {
    if (
      valueData?.type === 'lightning' && valueData?.method === 'keysend' && Array.isArray(valueData?.valueRecipients)
    ) {
      const userWallet = await getLNWallet()
      
      if (userWallet) {
        const normalizedValueRecipients = calculateSplit(valueData.valueRecipients, getGlobal().session.boostAmount)
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
          } catch (paymentError) {
            boostsSent = false
            error = paymentError
            console.log("LN Boost Payment error: ", paymentError)
          }
        }
      }
    }
  } catch (err) {
    console.log('Error Sending LNPayment: ', err)
  }

  if (error?.response?.data?.message) {
    Alert.alert('LNPay Error', `${error?.response?.data?.message}`)
    return false
  } else if (!boostsSent) {
    Alert.alert('LNPay Error', 'Something went wrong with one or more payments.')
    return false
  } else {
    return true
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
