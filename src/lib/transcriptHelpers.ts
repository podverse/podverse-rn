import { TranscriptRow, TranscriptType } from 'podverse-shared'
import { request } from '../services/request'
import { convertSecToHHMMSS, convertTranscriptTimestampToSeconds, decodeHTMLString } from './utility'

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

const parseTranscriptFile = (data: any, transcriptType: TranscriptType) => {
  if (!data) return []

  let parsedTranscript = [] as TranscriptRow[]

  if (transcriptType === 'application/json') {
    parsedTranscript = parseJSONFile(data)
  } else if (transcriptType === 'application/srt' || transcriptType === 'text/srt') {
    parsedTranscript = parseSRTFile(data)
  } else if (transcriptType === 'text/html') {
    // parseHTMLFile isn't working for at least this RSS feed https://feeds.buzzsprout.com/1.rss
    parsedTranscript = parseHTMLFile(data)
  } else if (transcriptType === 'text/vtt') {
    parsedTranscript = parseVTTFile(data)
  }

  return parsedTranscript
}

const parseJSONFile = (data: any) => {
  const { segments } = data
  const result = [] as TranscriptRow[]

  if (Array.isArray(segments)) {
    for (let i = 0; i < segments.length; i++) {
      const item = convertJSONSRTItemToTranscriptRow(segments[i], i)
      if (item) result.push(item)
    }
  }

  return result
}

const convertJSONSRTItemToTranscriptRow = (item: any, line: number) => {
  const { body, endTime, startTime, speaker } = item
  if (!startTime && startTime !== 0) return null
  const startTimeHHMMSS = convertSecToHHMMSS(startTime)
  if (!endTime && endTime !== 0) return null
  const endTimeHHMMSS = convertSecToHHMMSS(endTime)
  const text = body

  return {
    line,
    startTime,
    startTimeHHMMSS,
    endTime,
    endTimeHHMMSS,
    speaker,
    text
  } as TranscriptRow
}

const parseSRTFile = (data: string) => {
  const pattern = /(\d{1,})\n([0-9\x3a\x2c]{12})\s\x2d\x2d\x3e\s([0-9\x3a\x2c]{12})\n((.+?)\x3a\s)?(.*)\n(.*)\n/gim
  let matches

  const result = [] as TranscriptRow[]
  data = data.replace(/\r\n|\r|\n/g, '\n')

  while ((matches = pattern.exec(data)) !== null) {
    const item = convertParsedSRTItemToTranscriptRow(matches)
    if (item) result.push(item)
  }

  return result
}

const convertParsedSRTItemToTranscriptRow = (item: any) => {
  /*
    item[0] = full parsed as single line
    item[1] = line
    item[2] = start time
    item[3] = end time
    item[4] = speaker
    item[5] = speaker
    item[6] = text line 1
    item[7] = text line 2
  */

  const line = parseInt(item[1], 10)
  const startTime = convertTranscriptTimestampToSeconds(item[2])
  if (!startTime && startTime !== 0) return null
  const startTimeHHMMSS = convertSecToHHMMSS(startTime)
  const endTime = convertTranscriptTimestampToSeconds(item[3])
  if (!endTime && endTime !== 0) return null
  const endTimeHHMMSS = convertSecToHHMMSS(endTime)
  const speaker = item[4]
  let text = item[6]
  if (item[7]) text += ` ${item[7]}`

  return {
    line,
    startTime,
    startTimeHHMMSS,
    endTime,
    endTimeHHMMSS,
    speaker,
    text
  } as TranscriptRow
}

const parseHTMLFile = (data: string) => {
  data = (data && data.trim()) || ''
  // eslint-disable-next-line max-len
  const pattern = /\x3ccite\x3e(.+?)\x3a\x3c\x2fcite\x3e\n\s{1,}?\x3ctime\x3e([0-9\x3a\x2c]{1,12})\x3c\x2ftime\x3e\n\s{1,}?\x3cp\x3e(.+?)\x3c\x2fp\x3e/gim
  let matches

  const result = [] as TranscriptRow[]
  data = data.replace(/\r\n|\r|\n/g, '\n')

  let index = 0
  while ((matches = pattern.exec(data)) !== null) {
    const item = convertParsedHTMLItemToTranscriptRow(matches, index)
    index++
    if (item) result.push(item)
  }

  return result
}

const convertParsedHTMLItemToTranscriptRow = (item: any, line: number) => {
  /*
    item[0] = full parsed as single line
    item[1] = speaker
    item[2] = start time
    item[3] = text
  */
  const speaker = item[1]
  const startTime = convertTranscriptTimestampToSeconds(item[2])
  if (!startTime && startTime !== 0) return null
  const startTimeHHMMSS = convertSecToHHMMSS(startTime)
  const text = decodeHTMLString(item[3])

  return {
    line,
    startTime,
    startTimeHHMMSS,
    speaker,
    text
  } as TranscriptRow
}

const parseVTTFile = (data: string) => {
  const pattern = /([0-9\x3a\x2e]{12})\s\x2d\x2d\x3e\s([0-9\x3a\x2e]{12})\n((.+?)\x3a\s)?(.*)\n(.*)\n\n/gim
  let matches

  const result = [] as any[]
  data = data.replace(/\r\n|\r|\n/g, '\n')

  let index = 0
  while ((matches = pattern.exec(data)) !== null) {
    const item = convertParsedVTTItemToTranscriptRow(matches, index)
    index++
    if (item) result.push(item)
  }

  return result
}

const convertParsedVTTItemToTranscriptRow = (item: any, line: number) => {
  /*
    item[0] = full parsed as single line
    item[1] = start time
    item[2] = end time
    item[3] = speaker
    item[4] = speaker
    item[5] = text line 1
    item[6] = text line 2
  */
  const startTime = convertTranscriptTimestampToSeconds(item[1])
  if (!startTime && startTime !== 0) return null
  const startTimeHHMMSS = convertSecToHHMMSS(startTime)
  const endTime = convertTranscriptTimestampToSeconds(item[2])
  if (!endTime && endTime !== 0) return null
  const endTimeHHMMSS = convertSecToHHMMSS(endTime)
  const speaker = item[3]
  let text = item[5]
  if (item[6]) text += ` ${item[6]}`

  return {
    line,
    startTime,
    startTimeHHMMSS,
    endTime,
    endTimeHHMMSS,
    speaker,
    text
  } as TranscriptRow
}
