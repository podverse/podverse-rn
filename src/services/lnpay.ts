import axios from 'axios'
import { ValueTransaction, ValueRecipientNormalized } from 'podverse-shared'
import { getLNWallet, LNWallet, LNWalletInfo, updateWalletInfo } from '../state/actions/lnpay'
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
      ...headers
    },
    data: body,
    method,
    ...opts,
    timeout: 30000
  }

  try {
    const response = await axios(axiosRequest)
    return response.data
  } catch (error) {
    console.log('LNPay Request error', error.response.data)
    throw error
  }
}

export const createWallet = async (apiKey = '', label?: string): Promise<LNWallet | undefined> => {
  try {
    const createdWallet = await request({
      endpoint: '/wallet',
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
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

export const getWalletInfo = async (wallet: LNWallet): Promise<LNWalletInfo | null> => {
  let walletInfo = null
  try {
    const resp = await request({
      endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'],
      headers: {
        'X-Api-Key': wallet.publicKey
      }
    })
    if (resp.id) {
      walletInfo = resp
    }
  } catch (error) {
    throw new Error('Wallet Fetch Failed. ' + error.message)
  }

  return walletInfo
}

export const getWallet = async (wallet: LNWallet): Promise<LNWallet | null> => {
  let existingWallet: LNWallet | null = null

  try {
    const resp = await request({
      endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'] + `?access-token=${wallet.publicKey}`
    })

    if (resp.id === wallet.id) {
      existingWallet = wallet
    }
  } catch (error) {
    if (error.status === 404) {
      console.log('getWallet error 404 Not Found', error)
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

const generateLNPayKeysendRequestBody = (valueTransaction: ValueTransaction) => {
  const { address, amount } = valueTransaction.normalizedValueRecipient
  const { satoshiStreamStats } = valueTransaction

  /*
    NOTE: LNPay requires custom_records values to be stringified objects.
  */
  
  const customRecord7629169 = JSON.stringify(satoshiStreamStats[7629169])
  const customRecord7629175 = JSON.stringify(satoshiStreamStats[7629175])


  const stringifiedCustomRecords = {
    7629169: customRecord7629169,
    7629175: customRecord7629175
  }

  return {
    // passThru: {},
    dest_pubkey: address,
    num_satoshis: Math.ceil(amount),
    custom_records: stringifiedCustomRecords,
  } as LNPayKeysendRequestBody
}

export const sendLNPayValueTransaction = async (valueTransaction: ValueTransaction) => {
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

  await updateWalletInfo()

  return paymentWasSuccessful
}

const sendLNPayKeysendRequest = async (wallet: LNWallet, body: LNPayKeysendRequestBody) => {
  return request({
    method: 'POST',
    endpoint: '/wallet/' + wallet.access_keys['Wallet Admin'][0] + '/keysend',
    headers: {
      'X-Api-Key': wallet.publicKey,
      'Content-Type': 'application/json'
    },
    body
  })
}

export const checkLNPayRecipientRoute = async (wallet: LNWallet, recepient: ValueRecipientNormalized) => {
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
}