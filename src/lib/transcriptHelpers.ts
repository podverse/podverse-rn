import { parseTranscriptFile, TranscriptRow, TranscriptType } from 'podverse-shared'
import { request } from '../services/request'
import { errorLogger } from './logger'

const _fileName = 'src/lib/transcriptHelpers.ts'

export const getParsedTranscript = async (transcriptUrl: string, transcriptType: TranscriptType) => {
  let parsedTranscript = [] as TranscriptRow[]

  try {
    const response = await request({}, transcriptUrl)
    const { data } = response
    parsedTranscript = parseTranscriptFile(data, transcriptType)
  } catch (error) {
    errorLogger(_fileName, 'getParsedTranscript', error)
  }

  return parsedTranscript
}
