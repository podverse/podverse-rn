import { getLanguageTag } from '../../lib/i18n'

const defaultCurrency = 'USD'

const currencyLocales = {
  da: 'DKK',
  el: 'EUR',
  en: defaultCurrency,
  es: 'EUR',
  fr: 'EUR',
  lt: 'EUR',
  nb: 'NOK',
  oc: 'MAD',
  pt: 'EUR',
  ru: 'RUB',
  sv: 'SEK'
}

export const v4vGetCurrencyLocale = () => {
  const languageTag = getLanguageTag()
  return currencyLocales[languageTag] ? currencyLocales[languageTag] : defaultCurrency
}
