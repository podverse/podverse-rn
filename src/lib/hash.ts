import { Buffer } from 'buffer'

export const base64Encode = (str: string) => {
  const buffer = Buffer.from(str).toString('base64')
  return buffer
}
