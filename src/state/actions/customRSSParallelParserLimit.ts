import { setGlobal } from 'reactn'
import { setCustomRSSParallelParserLimit
  as setCustomRSSParallelParserLimitService } from "../../services/customRSSParallelParserLimit"

export const setCustomRSSParallelParserLimit = async (limit: number) => {
  const customRSSParallelParserLimit = await setCustomRSSParallelParserLimitService(limit)
  setGlobal({ customRSSParallelParserLimit })
}
