import { request } from '../services/request'
import { convertSecToHHMMSS, convertTranscriptTimestampToSeconds } from './utility'

export type TranscriptRow = {
  line: number
  startTime: number
  startTimeHHMMSS: string | null
  endTime: number
  endTimeHHMMSS: string | null
  text: string
  speaker?: string
}

export const getParsedTranscript = async (transcriptUrl: string) => {
  let transcript = [] as TranscriptRow[]

  try {
    const response = await request({}, transcriptUrl)
    const { data } = response
    transcript = parseSRTFile().parse(data)
  } catch (error) {
    console.log('getParsedTranscript error:', error)
  }

  return transcript
}

const parseSRTFile = () => {
  // SRT format
  const pattern = /(\d+)\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/gm;
  let matches;

  const parse = function(data: string) {
    const result = [] as any[];
    data = data.replace(/\r\n|\r|\n/g, '\n')

    while ((matches = pattern.exec(data)) !== null) {
      const item = convertParsedItemToTranscriptRow(matches)
      if (item) result.push(item)
    }

    return result
  }

  return { parse }
}

const convertParsedItemToTranscriptRow = (item: any) => {
  const line = parseInt(item[1], 10)
  const startTime = convertTranscriptTimestampToSeconds(item[2])
  if (!startTime && startTime !== 0) return null
  const startTimeHHMMSS = convertSecToHHMMSS(startTime)
  const endTime = convertTranscriptTimestampToSeconds(item[3])
  if (!endTime && endTime !== 0) return null
  const endTimeHHMMSS = convertSecToHHMMSS(endTime)
  const text = item[4]
  const speaker = item[5]

  return {
    line,
    startTime,
    startTimeHHMMSS,
    endTime,
    endTimeHHMMSS,
    text,
    speaker
  } as TranscriptRow
}
