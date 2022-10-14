import { translate } from '../lib/i18n'

const _useDeviceLanguage = 'use-device-language'
const _danishKey = 'da'
const _englishKey = 'en'
const _frenchKey = 'fr'
const _germanKey = 'de'
const _greekKey = 'el'
const _lithuanianKey = 'lt'
const _norwegianBokmalKey = 'nb_NO'
const _occitanKey = 'oc'
const _portugueseBrazilKey = 'pt_BR'
const _russianKey = 'ru'
const _spanishKey = 'es'
const _swedishKey = 'sv'
const _turkishKey = 'tr'

const languageOptions = () => {
  return [
    {
      label: translate('language - use device language'),
      value: _useDeviceLanguage
    },
    {
      label: translate('language - danish'),
      value: _danishKey
    },
    {
      label: translate('language - english'),
      value: _englishKey
    },
    {
      label: translate('language - french'),
      value: _frenchKey
    },
    {
      label: translate('language - german'),
      value: _germanKey
    },
    {
      label: translate('language - greek'),
      value: _greekKey
    },
    {
      label: translate('language - lithuanian'),
      value: _lithuanianKey
    },
    {
      label: translate('language - norwegian bokmal'),
      value: _norwegianBokmalKey
    },
    {
      label: translate('language - occitan'),
      value: _occitanKey
    },
    {
      label: translate('language - portuguese (brazil)'),
      value: _portugueseBrazilKey
    },
    {
      label: translate('language - russian'),
      value: _russianKey
    },
    {
      label: translate('language - spanish'),
      value: _spanishKey
    },
    {
      label: translate('language - swedish'),
      value: _swedishKey
    },
    {
      label: translate('language - turkish'),
      value: _turkishKey
    }
  ]
}

export const Languages = {
  languageOptions,
  defaultLanguageKey: _useDeviceLanguage,
  getLanguageKeyOption: (value: string) => {
    return languageOptions()
      .find((x: any) => x.value === value) || languageOptions()[0]
  },
  validLanguageKeys: [
    _useDeviceLanguage,
    _danishKey,
    _englishKey,
    _frenchKey,
    _germanKey,
    _greekKey,
    _lithuanianKey,
    _norwegianBokmalKey,
    _occitanKey,
    _portugueseBrazilKey,
    _russianKey,
    _spanishKey,
    _swedishKey,
    _turkishKey
  ]
}
