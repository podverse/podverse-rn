import { convertSecToHHMMSS, TranscriptRow } from 'podverse-shared'
import { convertFile, Options, TimestampFormatter } from 'transcriptator'
import { PV } from '../resources'
import { request } from '../services/request'
import { errorLogger } from './logger'

const _fileName = 'src/lib/transcriptHelpers.ts'

Options.setOptions({
  combineSegments: true,
  combineSegmentsLength: 64,
  speakerChange: true
})

TimestampFormatter.registerCustomFormatter(convertSecToHHMMSS)

const enrichTranscriptatorResult = (parsedTranscript: TranscriptRow[]) => {
  if (!parsedTranscript) return []
  let enrichedTranscript = []
  let lastPositionY = 0
  for (const [index, value] of parsedTranscript.entries()) {
    const hasSpeaker = value.speaker
    const isSingleLine = value.body?.length <= 32

    let height = 0
    if (hasSpeaker) {
      height = isSingleLine ?
        PV.FlatList.transcriptRowHeights.singleLineAndSpeaker : PV.FlatList.transcriptRowHeights.textAndSpeaker
    } else {
      height = isSingleLine
        ? PV.FlatList.transcriptRowHeights.singleLine : PV.FlatList.transcriptRowHeights.text
    }

    value.height = height
    const positionY = lastPositionY + height
    value.positionY = positionY
    enrichedTranscript.push(value)
    lastPositionY = positionY
    value.index = index
  }

  return enrichedTranscript
}


export const getParsedTranscript = async (transcriptUrl: string) => {
  let parsedTranscript = [] as TranscriptRow[]

  try {
    const response = await request({}, transcriptUrl)
    const { data } = response
    parsedTranscript = convertFile(data)
    parsedTranscript = enrichTranscriptatorResult(parsedTranscript)
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
    parsedTranscript = convertFile(data.data)
    parsedTranscript = enrichTranscriptatorResult(parsedTranscript)
  } catch (error) {
    console.log('getParsedTranscript error:', error)
  }

  return parsedTranscript
}
