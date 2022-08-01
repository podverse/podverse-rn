import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import { getWalletInfo } from '../../services/lnpay'
import { DEFAULT_BOOST_PAYMENT, DEFAULT_STREAMING_PAYMENT } from './valueTag'
export interface LNWallet {
  id: string
  publicKey: string
  access_keys: {
    'Wallet Admin': [string]
    'Wallet Invoice'?: [string]
    'Wallet Read'?: [string]
  }
}

export interface LNWalletInfo {
  id: string
  created_at: number
  updated_at: number
  user_label: string
  balance: number
  balance_msat: number | null
  statusType: {
    type: string
    name: string
    display_name: string
  }
  walletType: {
    name: string
    display_name: string
  }
}

export const toggleLNPayFeature = (toggle: boolean) => {
  const globalState = getGlobal()
  const defaultBoostAmount = DEFAULT_BOOST_PAYMENT
  const defaultStreamingAmount = DEFAULT_STREAMING_PAYMENT

  Promise.all([
    AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, String(defaultBoostAmount)),
    AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_STREAMING_AMOUNT, String(defaultStreamingAmount)),
    AsyncStorage.setItem(PV.Keys.LNPAY_ENABLED, String(toggle))
  ])

  setGlobal({
    session: {
      ...globalState.session,
      valueTagSettings: {
        ...globalState.session.valueTagSettings,
        lightningNetwork: {
          ...globalState.session.valueTagSettings.lightningNetwork,
          lnpay: {
            ...globalState.session.valueTagSettings.lightningNetwork.lnpay,
            lnpayEnabled: toggle,
            globalSettings: {
              boostAmount: defaultBoostAmount,
              streamingAmount: defaultStreamingAmount
            }
          }
        }
      }
    }
  })
}

export const saveLNPayWallet = async (wallet: LNWallet) => {
  await RNSecureKeyStore.set(PV.Keys.LN_WALLET_KEY, JSON.stringify(wallet), {
    accessible: ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
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

export const removeLNPayWallet = async () => {
  try {
    await RNSecureKeyStore.remove(PV.Keys.LN_WALLET_KEY)
  } catch (error) {
    console.log("Error removing LNPay: ", error)
  }
}

export const updateWalletInfo = async () => {
  const wallet = await getLNWallet()
  if (wallet) {
    const walletInfo = await getWalletInfo(wallet)
    if (walletInfo) {
      const globalState = getGlobal()
      setGlobal({
        session: {
          ...globalState.session,
          valueTagSettings: {
            ...globalState.session.valueTagSettings,
            lightningNetwork: {
              ...globalState.session.valueTagSettings.lightningNetwork,
              lnpay: {
                ...globalState.session.valueTagSettings.lightningNetwork.lnpay,
                walletSatsBalance: walletInfo?.balance,
                walletUserLabel: walletInfo?.user_label
              }
            }
          }
        }

      })
    }
  }
}