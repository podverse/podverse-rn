import * as RNLocalize from 'react-native-localize'

const defaultCurrency = 'USD'

export const v4vGetCurrencyLocale = () => {
  const currencies = RNLocalize.getCurrencies()
  const preferredCurrency = currencies?.[0] ? currencies[0] : defaultCurrency
  return preferredCurrency
}
