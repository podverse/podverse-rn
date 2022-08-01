import { parseTranscriptFile, TranscriptRow, TranscriptType } from 'podverse-shared'
import { request } from '../services/request'

export const getParsedTranscript = async (transcriptUrl: string, transcriptType: TranscriptType) => {
  let parsedTranscript = [] as TranscriptRow[]

  try {
    const response = await request({}, transcriptUrl)
    const { data } = response
    parsedTranscript = parseTranscriptFile(data, transcriptType)
  } catch (error) {
    console.log('getParsedTranscript error:', error)
  }

  return parsedTranscript
}
