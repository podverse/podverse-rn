import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import { DEFAULT_BOOST_PAYMENT, DEFAULT_STREAMING_PAYMENT } from './valueSettings'
export interface LNWallet {
  id: string
  publicKey: string
  access_keys: {
    'Wallet Admin': [string]
    'Wallet Invoice'?: [string]
    'Wallet Read'?: [string]
  }
}

export const toggleLNPayFeature = async (toggle: boolean) => {
  const globalState = getGlobal()
  const defaultBoostAmount = DEFAULT_BOOST_PAYMENT
  const defaultStreamingAmount = DEFAULT_STREAMING_PAYMENT
  
  await AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, String(defaultBoostAmount))
  await AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_STREAMING_AMOUNT, String(defaultStreamingAmount))
  await AsyncStorage.setItem(PV.Keys.LNPAY_ENABLED, String(toggle))

  setGlobal({
    session: {
      ...globalState.session,
      valueSettings: {
        ...globalState.session.valueSettings,
        lightningNetwork: {
          ...globalState.session.valueSettings.lightningNetwork,
          lnpayEnabled: toggle,
          globalSettings: {
            boostAmount: defaultBoostAmount,
            streamingAmount: defaultStreamingAmount
          }
        }
      }
    }
  })
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
