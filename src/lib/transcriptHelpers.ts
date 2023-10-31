import { convertSecToHHMMSS, removeLinebreaks, TranscriptRow } from 'podverse-shared'
import { convertFile, Options, TimestampFormatter } from 'transcriptator'
import wordWrap from 'word-wrap'
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

  const limitLines = 100
  let limitCount = 0

  for (const parsedRow of parsedTranscript) {
    limitCount++
    if (limitLines < limitCount) break

    const body = parsedRow.body || ''
    const hasSpeaker = !!parsedRow.speaker

    const joinedBody = removeLinebreaks(body)

    const results = wordWrap(joinedBody, {
      width: 32,
      indent: '',
      trim: true
    })
    const splitResults = results.split('\n')

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

    const lineCount = splitResults.length

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < splitResults.length; i++) {
      const str = splitResults[i]
      const line = {
        ...parsedRow,
        body: str,
        speaker: '',
        index: newIndex,
        lineCount,
        ...(i > 0 ? { speaker: '' } : {}),
        ...(i > 0 ? { startTimeFormatted: '' } : {}),
        ...(i > 0 ? { endTimeFormatted: '' } : {})
      }
      enrichedTranscript.push(line)
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
