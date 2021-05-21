/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from 'axios'
import { ValueTransaction, ValueRecipientNormalized } from 'podverse-shared'
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

type LNPayKeysendRequestBody = {
  // passThru: Record<string, unknown>
  dest_pubkey: string
  num_satoshis: number
  custom_records: Record<string, unknown>
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
  /*
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
  */
}

export const getWallet = /* async (walletInfo: LNWallet): Promise<LNWallet | null> */ () => {
  /*
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
  */
}

export const getAllWallets = (apiKey = '') => {
  /*
  return request({
    endpoint: '/wallets',
    headers: {
      'X-Api-Key': apiKey
    }
  })
  */
}

const generateLNPayKeysendRequestBody = (valueTransaction: ValueTransaction) => {
  const { address, amount } = valueTransaction.normalizedValueRecipient
  const { satoshiStreamStats } = valueTransaction
  
  return {
    // passThru: {},
    dest_pubkey: address,
    num_satoshis: Math.ceil(amount),
    custom_records: satoshiStreamStats,
  } as LNPayKeysendRequestBody
}

export const sendLNPayValueTransaction = async (valueTransaction: ValueTransaction) => {
  /*
  let error = null
  let paymentWasSuccessful = false
  
  try {
    const userWallet = await getLNWallet()
    
    if (userWallet) {
      const lnpayKeysendRequestBody = generateLNPayKeysendRequestBody(valueTransaction)
      try {
        await sendLNPayKeysendRequest(userWallet, lnpayKeysendRequestBody)
        paymentWasSuccessful = true
      } catch (paymentError) {
        error = paymentError
      }
    }
  } catch (err) {
    error = err
  }

  if (error) {
    console.log('sendLNPayValueTransaction error:', error)
  }

  if (error?.response?.data?.message) {
    throw new Error(error?.response?.data?.message)
  } else if (!paymentWasSuccessful || error) {
    throw error || new Error('Something went wrong with one or more payments.')
  }

  return paymentWasSuccessful
  */
}

const sendLNPayKeysendRequest = async (wallet: LNWallet, body: LNPayKeysendRequestBody) => {
  /*
  return request({
    method: 'POST',
    endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'][0] + '/keysend',
    headers: {
      'X-Api-Key': wallet.publicKey
    },
    body
  })
  */
}

export const checkLNPayRecipientRoute = async (wallet: LNWallet, recepient: ValueRecipientNormalized) => {
  /*
  return request({
    method: 'GET',
    endpoint: '/node/default/payments/queryroutes',
    headers: {
      'X-Api-Key': wallet.publicKey
    },
    query: {
      pub_key: recepient.address,
      amt: recepient.amount
    }
  })
  */
}