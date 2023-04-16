import { convertSecToHHMMSS, TranscriptRow } from 'podverse-shared'
import { convertFile } from 'transcriptator'
import { timestampFormatter } from 'transcriptator/timestamp'
import { request } from '../services/request'
import { errorLogger } from './logger'

const _fileName = 'src/lib/transcriptHelpers.ts'

export const getParsedTranscript = async (transcriptUrl: string) => {
  let parsedTranscript = [] as TranscriptRow[]

  try {
    const response = await request({}, transcriptUrl)
    const { data } = response
    timestampFormatter.registerCustomFormatter(convertSecToHHMMSS)
    parsedTranscript = convertFile(data.data)
  } catch (error) {
    errorLogger(_fileName, 'getParsedTranscript', error)
  }

  return parsedTranscript
}
