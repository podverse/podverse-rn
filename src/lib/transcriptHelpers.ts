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
    parsedTranscript = convertFile(data)
  } catch (error) {
    errorLogger(_fileName, 'getParsedTranscript', error)
  }

  return parsedTranscript
}

export const getEpisodeProxyTranscript = async (episodeId: string, language?: string) => {
  let parsedTranscript = [] as TranscriptRow[]

  const endpoint = language
    ? `/episode/${episodeId}/proxy/transcript?${language}`
    : `/episode/${episodeId}/proxy/transcript`

  try {
    const response = await request({
      endpoint,
      opts: { timeout: 15000 }
    })
    const { data } = response
    timestampFormatter.registerCustomFormatter(convertSecToHHMMSS)
    parsedTranscript = convertFile(data.data)
  } catch (error) {
    console.log('getParsedTranscript error:', error)
  }

  return parsedTranscript
}
