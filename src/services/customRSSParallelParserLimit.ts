import AsyncStorage from '@react-native-community/async-storage'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'

const _fileName = 'src/services/customRSSParallelParserLimit.ts'

export const getCustomRSSParallelParserLimit = async () => {
  let customRSSParallelParserLimit = PV.CustomRSS.parallelParserDefaultLimit
  try {
    const str = await AsyncStorage.getItem(PV.Keys.CUSTOM_RSS_PARALLEL_PARSER_LIMIT)
    if (str) {
      const int = parseInt(str, 10)
      if (int >= 1) {
        customRSSParallelParserLimit = parseInt(str, 10)
      }
    }
  } catch (error) {
    errorLogger(_fileName, 'getCustomRSSParallelParserLimit', error)
  }
  return customRSSParallelParserLimit
}

export const setCustomRSSParallelParserLimit = async (limit: number) => {
  try {
    limit = limit <= 0 || isNaN(limit) ? PV.CustomRSS.parallelParserDefaultLimit : limit
    await AsyncStorage.setItem(PV.Keys.CUSTOM_RSS_PARALLEL_PARSER_LIMIT, limit.toString())
  } catch (error) {
    errorLogger(_fileName, 'setCustomRSSParallelParserLimit', error)
  }

  return limit
}
