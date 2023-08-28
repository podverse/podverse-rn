import { convertSecToHHMMSS, TranscriptRow } from 'podverse-shared'
import { convertFile, Options, TimestampFormatter } from 'transcriptator'
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

  const enrichedTranscript = []
  let newIndex = 0

  for (const parsedRow of parsedTranscript) {
    const body = parsedRow.body || ''
    const hasSpeaker = !!parsedRow.speaker

    if (hasSpeaker) {
      const emptySpaceValue = {
        isEmptySpace: true,
        index: newIndex
      }
      enrichedTranscript.push(emptySpaceValue)
      newIndex++

      const speakerValue = {
        speaker: parsedRow.speaker?.trim(),
        index: newIndex
      }
      enrichedTranscript.push(speakerValue)
      newIndex++
    }

    // Make sure we only split on a clean word-wrap.
    const getSplitIndex = (body: string) => {
      const isMoreThan1Line = body.length >= 33
      if (isMoreThan1Line) {
        const splitIndex = body.indexOf(' ', 32) || body.indexOf('-', 32)
        if (splitIndex > 32) {
          return splitIndex
        } else {
          const splitIndex = body.indexOf(' ', 24) || body.indexOf('-', 24)
          return splitIndex
        }
      }
      return 32
    }

    const splitIndex = getSplitIndex(body)

    const line2 = body.substring(splitIndex)
    const hasTwoLines = body.length >= 33 && body.length >= splitIndex && line2?.trim().length > 0

    const line1 = body.substring(0, splitIndex)
    const line1Value = {
      ...parsedRow,
      body: line1.trim(),
      speaker: '',
      index: newIndex,
      hasTwoLines
    }
    enrichedTranscript.push(line1Value)
    newIndex++

    if (hasTwoLines) {
      const line2Value = {
        ...parsedRow,
        body: line2.trim(),
        speaker: '',
        startTimeFormatted: '',
        endTimeFormatted: '',
        index: newIndex
      }
      enrichedTranscript.push(line2Value)
      newIndex++
    }
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
