import { updateAppStorePurchaseStatus } from './appStorePurchase'

export const iosHandlePurchaseStatusCheck = async (transactionReceipt: string) => {
  try {
    await updateAppStorePurchaseStatus(transactionReceipt)
  } catch (error) {
    throw (error)
  }
}
