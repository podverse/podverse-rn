import { Platform } from 'react-native'
import Config from 'react-native-config'
import { getAvailablePurchases, getProducts, requestPurchase } from 'react-native-iap'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { PV } from '../resources'

// Purchase items
const itemSkus = Platform.select({
  ios: [Config.PURCHASE_ITEM_SKU_IOS],
  android: [Config.PURCHASE_ITEM_SKU_ANDROID]
})

const _premiumMembership1Year = itemSkus[0]

export const buy1YearPremium = async () => {
  await getProducts(itemSkus)
  await requestPurchase(_premiumMembership1Year, false)
}

/*
  The bug (?) below might be iOS only.
  
  When react-native-iap's getAvailablePurchases method is called,
  it returns the purchases that have not been consumed yet, but then
  immediately consumes them, so the next time we call getAvailablePurchases,
  the purchase will be gone regardless of whether we successfully processed
  the transaction yet.

  To work around this, we are saving all available purchases to secure storage,
  and using those values in secure storage as a fallback in case react-native-iap's
  getAvailablePurchaes returns an empty array.
*/

export const getAvailablePurchasesFromSecureStorage = async () => {
  let availablePurchases = []
  try {
    availablePurchases = await RNSecureKeyStore.get(PV.Keys.AVAILABLE_PURCHASES)
    availablePurchases = JSON.parse(availablePurchases)
  } catch (error) {
    console.log('getAvailablePurchasesFromSecureStorage error', error)
    return []
  }
  return availablePurchases
}

export const setAvailablePurchasesInSecureStorage = async (availablePurchases: any[]) => {
  try {
    if (availablePurchases) {
      await RNSecureKeyStore.set(PV.Keys.AVAILABLE_PURCHASES, JSON.stringify(availablePurchases), {
        accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY
      })
    } else {
      await clearAvailablePurchasesFromSecureStorage()
    }
  } catch (error) {
    console.log('setAvailablePurchasesInSecureStorage error', error)
  }
}

export const addAvailablePurchasesToSecureStorage = async (purchasesToAdd: any[]) => {
  try {
    const availablePurchases = await getAvailablePurchasesFromSecureStorage()
    for (const purchaseToAdd of purchasesToAdd) {
      const shouldAdd = availablePurchases.every(
        (availablePurchase: any) => availablePurchase.transactionId !== purchaseToAdd.transactionId)
      if (shouldAdd) availablePurchases.push(purchaseToAdd)
    }
    await setAvailablePurchasesInSecureStorage(availablePurchases)
  } catch (error) {
    console.log('addAvailablePurchasesToSecureStorage error', error)
  }
}

/*
  IMPORTANT: removeAvailablePurchaseFromSecureStorage must be called every time
  after finishTransaction and consumePurchaseAndroid successfully consume a purchase.
*/
export const removeAvailablePurchaseFromSecureStorage = async (transactionIdToRemove: any) => {
  let availablePurchases = await getAvailablePurchasesFromSecureStorage()
  availablePurchases = availablePurchases.filter(
    (purchase: any) => purchase.transactionId !== transactionIdToRemove)
  await setAvailablePurchasesInSecureStorage(availablePurchases)
  return availablePurchases
}

const clearAvailablePurchasesFromSecureStorage = async () => {
  try {
    await RNSecureKeyStore.set(PV.Keys.AVAILABLE_PURCHASES, JSON.stringify([]), {
      accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY
    })
  } catch (error) {
    console.log('clearAvailablePurchasesFromSecureStorage error', error)
  }
}
