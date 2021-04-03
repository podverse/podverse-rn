import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'

export interface LNWallet {
  id: string
  publicKey: string
  access_keys: {
    'Wallet Admin': [string]
    'Wallet Invoice': [string]
    'Wallet Read': [string]
  }
}

export interface Value {
  model: Model
  destinations: DestinationsEntity[]
}

export interface Model {
  type: string
  method: string
  suggested: string
}

export interface DestinationsEntity {
  name: string
  address: string
  type: string
  split: number
  normalizedSplit?: number
  customKey?: string
  customValue?: unknown
  fee?: boolean | null
  amount?: number
}

export const toggleLNPayFeature = async (toggle: boolean) => {
  const globalState = getGlobal()

  await AsyncStorage.setItem(PV.Keys.LNPAY_ENABLED, String(toggle))

  setGlobal({ session: { ...globalState.session, lightningPayEnabled: toggle } })
}

export const saveLNPayWallet = async (wallet: LNWallet) => {
  await RNSecureKeyStore.set(PV.Keys.LN_WALLET_KEY, JSON.stringify(wallet), {
    accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  })
}

export const getLNWallet = async (): Promise<LNWallet | null> => {
  let wallet = null
  try {
    const savedWallet = await RNSecureKeyStore.get(PV.Keys.LN_WALLET_KEY)
    if (savedWallet) {
      wallet = JSON.parse(savedWallet)
    }
  } catch (error) {
    if (error.code === 404) {
      console.log('Wallet does not exist in secure storage')
      wallet = null
    }
  }
  return wallet
}

export const removeLNPayWallet = () => {
  return RNSecureKeyStore.remove(PV.Keys.LN_WALLET_KEY)
}

export const calculateSplit = (destinations: DestinationsEntity[], total: number) => {
  destinations = normalizeSplit(destinations)
  const feeRecepient = destinations.find((receiver) => receiver.fee === true)
  let feeAmount = 0
  if (feeRecepient) {
    feeAmount = (total / 100) * (feeRecepient.normalizedSplit || 0)
    total = total - feeAmount
  }

  const splitAmounts: DestinationsEntity[] = []
  for (const receiver of destinations) {
    let amount = (total / 100) * (receiver.normalizedSplit || 0)

    if (feeAmount && receiver.fee) {
      amount = feeAmount
    }

    splitAmounts.push({
      ...receiver,
      amount: Math.round(amount)
    })
  }

  return splitAmounts
}

const normalizeSplit = (destinations: DestinationsEntity[]) => {
  const totalSplit = destinations.reduce((total, destination) => {
    return total + destination.split
  }, 0)

  destinations = destinations.map((destination) => {
    return {
      ...destination,
      normalizedSplit: (destination.split / totalSplit) * 100
    }
  })

  return destinations
}
